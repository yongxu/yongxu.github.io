import Parser from "./shunt"
import React from "react"
import ReactDOM from "react-dom"
import Terminal from "./terminal"

export default function({parser,terminal}){
  return new Promise(function(resolve, reject){
    parser.parse(require('raw!./scripts/home.txt'))
  })
}
