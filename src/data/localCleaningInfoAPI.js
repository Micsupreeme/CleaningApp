let cleaningInfoArray = 
[
    {
        headlineType: 1,
        body: "Dishwashing can be used as an effective informal mindfulness practice",
        sourceUrl: "https://link.springer.com/article/10.1007/s12671-014-0360-9"
    },
    {
        headlineType: 1,
        body: "If you never clean your smartphone, it may contain 10 times more bacteria than an average toilet seat!",
        sourceUrl: "https://jkscience.org/archive/vol113/6-Original%20Article%20-%20cell%20phones.pdf"
    },
    {
        headlineType: 2,
        body: "Ensure that every task has a clear starting and ending point",
        sourceUrl: "https://journals.sagepub.com/doi/pdf/10.1177/002214650404500201"
    },
    {
        headlineType: 2,
        body: "Incorporate leisure into cleaning tasks, e.g., take regular breaks and listen to music",
        sourceUrl: "https://journals.sagepub.com/doi/pdf/10.1177/002214650404500201"
    },
    {
        headlineType: 2,
        body: "Reframe \"have-to\" tasks into \"want-to\" tasks: what are the benefits of doing the task?",
        sourceUrl: "https://onlinelibrary.wiley.com/doi/pdf/10.1002/cbl.30009"
    },
    {
        headlineType: 2,
        body: "Ensure that your daily routine is manageable, not overloaded",
        sourceUrl: "https://journals.sagepub.com/doi/pdf/10.1177/002214650404500201"
    }
]

/**
 * returns the specified info item
 * @param infoId the ID of the info item to be returned
 * @returns the specified info item
 */
function getCleaningInfo(infoId) {
    return cleaningInfoArray[infoId]
}

/**
 * returns the number of available info items
 * @returns the number of available info items
 */
function getCleaningInfoArrSize() {
    return cleaningInfoArray.length
}

/**
 * Wraps up functions as an object
 */
const LocalCleaningInfoAPI = {
    getCleaningInfo,
    getCleaningInfoArrSize
}

export default LocalCleaningInfoAPI