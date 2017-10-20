"use strict"

const express = require("express")
const app = express()
const parser = require("body-parser")
const logic = require("./logic")
const async = require("async")
const files = require("fs")
const jdbc = require("jdbc")
const jins = require("jdbc/lib/jinst")
const request = require("request")

app.use(parser.json())

app.use((req, res, nxt) => {
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Methods", "GET, POST, DELETE")
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
	nxt()
})

app.route("/oracle")
    .post((req, res) => {
        if(req.body.config.host && req.body.config.db && req.body.config.user && req.body.config.pass && req.body.queries) {
            if(Array.isArray(req.body.queries)) {
                if(!jins.isJvmCreated()) {
                    jins.addOption("-Xrs")
                    jins.setupClasspath([
                        "./jars/ojdbc7.jar",
                        "./jars/terajdbc4.jar",
                        "./jars/tdgssconfig.jar"
                    ])
                }
                
                let conf = {
                    url: "jdbc:oracle:thin:@//" + req.body.config.host + "/" + req.body.config.db,
                    properties: {
                        user: req.body.config.user,
                        password: req.body.config.pass
                    }
                }
                
                let inst = new jdbc(conf)
                
                inst.initialize((err) => {
                    if(err) {
                        logic.logProbs(err)
                    } else {
                        inst.reserve(function (err, cobj) {
                            if(cobj) {
                                let conn = cobj.conn,
                                    ques = []
                                    
                                req.body.queries.forEach((query) => {
                                    ques.push((cb) => {
                                        conn.createStatement((err, smnt) => {
                                            if(err) {
                                                cb(err);
                                            } else {
                                                smnt.executeQuery(query, (err, results) => {
                                                    if(err) {
                                                        cb(err)
                                                    } else {
                                                        if(results) {
                                                            results.toObjArray((err, res) => {
                                                                res.forEach((obj, arrayIndex) => {
                                                                    Object.keys(obj).forEach((element, index) => {
                                                                        let value = obj[Object.keys(obj)[index]]
    
                                                                        if(typeof(value) === 'object' && value){
                                                                            let stringy = String(obj[Object.keys(obj)[index]])
    
                                                                            res[arrayIndex][element] = stringy
                                                                        }
                                                                    })
                                                                })

                                                                cb(null, res)
                                                            })
                                                        } else {
                                                            cb(null)
                                                        }
                                                    }
                                                })
                                            }
                                        })
                                    })
                                        
                                    if(ques.length === req.body.queries.length) {
                                        async.series(ques, (err, yup) => {
                                            if(err) {
                                                logic.logProbs(err)
                                            } else {
                                                conn.close((err) => {
                                                    if(err) {
                                                        logic.logProbs(err)
                                                    } else {
                                                        inst.release(cobj, (err) => {
                                                            if(err) {
                                                                logic.logProbs(err)
                                                            } else {
                                                                res.send(yup)
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            } else {
                                logic.logProbs(err)
                            }
                        })
                    }
                })
            } else {
                res.send("Read and follow documentation to properly query this API...")
            }
        } else {
            res.send("Read and follow documentation to properly query this API...")
        }
    })

app.route("/teradata")
    .post((req, res) => {
        if(req.body.config.db && req.body.config.user && req.body.config.pass && req.body.queries) {
            if(Array.isArray(req.body.queries)) {
                if(!jins.isJvmCreated()) {
                    jins.addOption("-Xrs")
                    jins.setupClasspath([
                        "./jars/tdgssconfig.jar",
                        "./jars/terajdbc4.jar",
                        "./jars/ojdbc7.jar"
                    ])
                }
                
                let conf = {
                    url: "jdbc:teradata://" + req.body.config.db,
                    properties: {
                        user: req.body.config.user,
                        password: req.body.config.pass
                    }
                }
                
                let inst = new jdbc(conf)
                
                inst.initialize((err) => {
                    if(err) {
                        logic.logProbs(err)
                    } else {
                        inst.reserve((err, cobj) => {
                            if(cobj) {
                                let conn = cobj.conn,
                                    ques = []
                                    
                                req.body.queries.forEach((query) => {
                                    ques.push((cb) => {
                                        conn.createStatement((err, smnt) => {
                                            if(err) {
                                                cb(err)
                                            } else {
                                                smnt.executeQuery(query, (err, results) => {
                                                    if(err) {
                                                        cb(err)
                                                    } else {
                                                        if(results) {
                                                            results.toObjArray((err, res) => {
                                                                cb(null, res)
                                                            })
                                                        } else {
                                                            cb(null)
                                                        }
                                                    }
                                                })
                                            }
                                        })
                                    })
                                        
                                    if(ques.length === req.body.queries.length) {
                                        async.series(ques, (err, yup) => {
                                            if(err) {
                                                logic.logProbs(err)
                                            } else {
                                                conn.close((err) => {
                                                    if(err) {
                                                        logic.logProbs(err)
                                                    } else {
                                                        inst.release(cobj, (err) => {
                                                            if(err) {
                                                                logic.logProbs(err)
                                                            } else {
                                                                res.send(yup)
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            } else {
                                logic.logProbs(err)
                            }
                        })
                    }
                })
            } else {
                res.send("Read and follow documentation to properly query this API...")
            }
        } else {
            res.send("Read and follow documentation to properly query this API...")
        }
    })

app.listen(9000)