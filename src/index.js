"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase = __importStar(require("firebase-admin"));
const events_1 = __importDefault(require("events"));
const lodash_merge_1 = __importDefault(require("lodash.merge"));
module.exports = class FireDB extends events_1.default {
    db;
    constructor() {
        super();
    }
    connect(servAccount) {
        firebase.initializeApp({
            credential: firebase.credential.cert(servAccount)
        });
        this.db = firebase.firestore();
        this.emit('connect');
    }
    async getCollection(collection) {
        const fetched = await this.db.collection(collection).get();
        if (!fetched.size)
            return undefined;
        let final = new Map();
        fetched.forEach((d) => final.set(d.id, d.data()));
        return final;
    }
    async get(path) {
        const rawPath = path.split('.');
        if (rawPath.length < 2)
            throw new Error(`${rawPath.length < 1 ? 'Collection and Document' : 'Document'} path is not defined. Please make sure you've specified both.`);
        const baseDocument = await this.db.collection(rawPath[0]).doc(rawPath[1]).get();
        if (!baseDocument.exists)
            throw new Error('Collection or Document not found!');
        return rawPath.length <= 2 ? baseDocument.data() : this.getValue(baseDocument.data(), path);
    }
    async set(path, value) {
        const rawPath = path.split('.');
        if (rawPath.length < 2)
            throw new Error(`${rawPath.length < 1 ? 'Collection and Document' : 'Document'} path is not defined. Please make sure you've specified both.`);
        const merge1 = await this.db.collection(rawPath[0]).doc(rawPath[1]).get();
        if (!merge1.exists)
            throw new Error('Collection or Document doesn\'t exists! Use create method instead!');
        this.emit('dataChange', merge1.data(), lodash_merge_1.default(this.getPath(path, value), merge1.data()));
        return await this.db.collection(rawPath[0]).doc(rawPath[1]).update(lodash_merge_1.default(this.getPath(path, value), merge1.data()));
    }
    getValue(baseObject, path) {
        const pathArray = path.split('.');
        const target = pathArray[pathArray.length - 1];
        let index = 0;
        let value;
        const getFinal = (obj) => {
            if (index === pathArray.length)
                throw new Error('Invalid path was given! Please check your path again!');
            if (obj[target])
                return value = obj[target];
            let temp = index;
            index++;
            getFinal(obj[pathArray.slice(2)[temp]]);
        };
        getFinal(baseObject);
        return value;
    }
    getPath(path, val) {
        const pathArray = path.split('.').slice(2);
        let finalObj = {};
        let index = 0;
        const getFinal = (obj) => {
            if (index === pathArray.length)
                return;
            obj[pathArray[index]] = index === pathArray.length - 1 ? val : {};
            let temp = index;
            index++;
            getFinal(obj[pathArray[temp]]);
        };
        getFinal(finalObj);
        return finalObj;
    }
};
