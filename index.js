module.exports = class dataLayer {
    /**
     * Instantiates the dataLayer class
     * @param  {string} page The page object as provided by puppeteer
     * @param  {string} containerId The containerId of the GTM container you want to interact with
     */
    constructor(page, containerId) {
        this.page = page
        this.containerId = containerId
    }

    /**
     * Gets the current value of the specified dataLayer variable
     * @param  {string} variable The variable in the regular [GTM
     * dot-notation](https://www.simoahava.com/analytics/variable-guide-google-tag-manager/#5-data-layer-variable)
     * @return {Promise}         Promise that resolves to the current value of
     * the variable
     */
    async get(variable) {
        return this.page.evaluate(
            function(containerId, variable) {
                return new Promise((resolve, reject) => {
                    resolve(
                        window.google_tag_manager[containerId].dataLayer.get(
                            variable
                        )
                    )
                })
            },
            this.containerId,
            variable
        )
    }

    /**
     * Returns all active container IDs for the page
     * @return {array} An array of strings containing all container IDs
     */
    async getContainerIDs() {
        return this.page.evaluate(function() {
            return new Promise((resolve, reject) => {
                var gtm = window.google_tag_manager
                if (gtm) {
                    var containerIds = []
                    for (property in gtm) {
                        if (property.startsWith("GTM-"))
                            containerIds.push(property)
                    }
                    resolve(containerIds)
                } else {
                    reject(new Error("No GTM container found on the page"))
                }
            })
        })
    }

    /**
     * Returns the the full data model, i. e. the current names and values of
     * all variables in dataLayer
     * @param  {string}  The GTM Container ID to fetch the data model from.
     * Defaults to the `containerId` defined on the instance
     * @return {Promise} A Promise that resolves to the data model of dataLayer
     * as an object
     */
    async getDataModel(containerId = this.containerId) {
        return this.page.evaluate(function(containerId) {
            return new Promise((resolve, reject) => {
                try {
                    var dataModel = google_tag_manager[
                        containerId
                    ].dataLayer.get({
                        split: function() {
                            return []
                        },
                    })
                    resolve(dataModel)
                } catch (e) {
                    reject(e)
                }
            })
        }, containerId)
    }

    /**
     * Returns all dataLayer events matching the given event name
     * @param  {string} event The event name
     * @return {array}       An array of event objects
     */
    async getEvents(event) {
        return this.page.evaluate(function(event) {
            return new Promise((resolve, reject) => {
                try {
                    var events = window.dataLayer.filter(msg => {
                        return msg.event == event
                    })
                    resolve(events)
                } catch (e) {
                    reject(e)
                }
            })
        }, event)
    }

    /**
     * Returns the most recent event matching the specified event name from
     * dataLayer. Simply returns the most recent event if no eventName is
     * specified
     * @param  {string} eventName The event name to match
     * @return {Promise}           A Promise that resolves to the latest da
     * event
     */
    async getLatestEvent(eventName) {
        let dL = await this.history
        let matchingEvents
        if (eventName !== undefined) {
            matchingEvents = dL.filter(event => {
                return event.event == eventName
            })
        }
        return matchingEvents[matchingEvents.length - 1]
    }

    /**
     * Returns the most recent message from dataLayer
     * @return {Promise}  A Promise that resolves to the latest dataLayer message
     */
    async getLatestMessage() {
        let dL = await this.history
        return dL[dL.length - 1]
    }

    /**
     * Retrieves all messages that are present in dataLayer
     * @return {Promise} A Promise that resolves to the full dataLayer array
     */
    get history() {
        return this.page.evaluate(() => {
            return new Promise((resolve, reject) => {
                try {
                    resolve(
                        JSON.parse(
                            JSON.stringify(dataLayer, function(key, value) {
                                // Detect whether a value in dataLayer is an HTML
                                // object. If yes, replace it to keep dataLayer
                                // serializable
                                if (
                                    typeof value === "object" &&
                                    value !== null &&
                                    value.nodeType > 0
                                ) {
                                    value = "[HTMLObject]"
                                }
                                return value
                            })
                        )
                    )
                } catch (e) {
                    reject(e.message)
                }
            })
        })
    }

    /**
     * Pushes a message (which can be an event) to the dataLayer
     * @param  {object} message The message to push
     */
    async push(message) {
        return this.page.evaluate(function(message) {
            return new Promise((resolve, reject) => {
                try {
                    window.dataLayer.push(message)
                    resolve()
                } catch (e) {
                    reject(e)
                }
            })
        }, message)
    }

    /**
     * Waits for the specified dataLayer event
     * @param  {string} event The event to wait for
     * @param  {object} options Options to supply to the underlying
     * waitForFunction, see the [puppeteer documentation for valid
     * options](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagewaitforfunctionpagefunction-options-args)
     * @return {promise}      A promise that resolves as soon as the event
     * happens
     */
    async waitForEvent(event, options = {}) {
        return this.page.waitForFunction(
            event => {
                return (
                    window.dataLayer.filter(msg => msg.event == event).length >
                    0
                )
            },
            options,
            event
        )
    }
}
