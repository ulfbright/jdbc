"use strict"

const config = require("./config")
const elastic = require("elasticsearch").Client({host: config.elastic})

exports.logProbs = function (mess) {
    elastic.index({
        index: "errors",
        type: "jdbc",
        body: mess
    }, (foo, bar) => {
        if(foo) {
            console.error(foo)
        }
    })
}