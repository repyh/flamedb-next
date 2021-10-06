import * as firebase from 'firebase-admin';
import { serviceAccount } from './constants/interface';
import events from 'events';
import merge from 'lodash.merge';

module.exports = class FireDB extends events {
    
    private db: any;

    constructor() {
        super();
    }

    public connect(servAccount: serviceAccount) {
        firebase.initializeApp({
            credential: firebase.credential.cert(servAccount)
        });
        this.db = firebase.firestore();
        this.emit('connect');
    }

    public async getCollection(collection: string) {
        const fetched = await this.db.collection(collection).get();
        if(!fetched.size) return undefined;
        let final: Map<string, any> = new Map();
        fetched.forEach((d: any) => final.set(d.id, d.data()));
        return final;
    }

    public async create(path: string, val: any) {
        const rawPath = path.split('.');
        if(typeof val !== 'object' && val !== null) throw new Error('Value type must that of an object!');
        return await this.db.collection(rawPath[0]).doc(rawPath[1]).set(val)
    }

    public async get(path: string) {
        const rawPath = path.split('.');
        if(rawPath.length < 2) throw new Error(`${rawPath.length < 1 ? 'Collection and Document' : 'Document'} path is not defined. Please make sure you've specified both.`);
        const baseDocument = await this.db.collection(rawPath[0]).doc(rawPath[1]).get();
        if(!baseDocument.exists) throw new Error('Collection or Document not found!');
        return rawPath.length <= 2 ? baseDocument.data() : this.getValue(baseDocument.data(), path);
    }

    public async set(path: string, value: any) {
        const rawPath = path.split('.');
        if(rawPath.length < 2) throw new Error(`${rawPath.length < 1 ? 'Collection and Document' : 'Document'} path is not defined. Please make sure you've specified both.`);
        const merge1 = await this.db.collection(rawPath[0]).doc(rawPath[1]).get();
        if(!merge1.exists) throw new Error('Collection or Document doesn\'t exists! Use create method instead!');
        this.emit('dataChange', merge1.data(), merge(this.getPath(path, value), merge1.data()))
        return await this.db.collection(rawPath[0]).doc(rawPath[1]).update(merge(this.getPath(path, value), merge1.data()));
    }

    private getValue(baseObject: any, path: string) {
        const pathArray: string[] = path.split('.');
        const target = pathArray[pathArray.length-1];
        let index = 0;
        let value: any;

        const getFinal = (obj: any) => {
            if(index === pathArray.length) throw new Error('Invalid path was given! Please check your path again!');
            if(obj[target]) return value = obj[target]
            let temp: number = index;
            index++;
            getFinal(obj[pathArray.slice(2)[temp]]);
        }

        getFinal(baseObject);
        return value;
    }

    private getPath(path: string, val: any) {
        const pathArray: string[] = path.split('.').slice(2);
        let finalObj: any = {};
        let index: number = 0;

        const getFinal = (obj: any) => {
            if(index === pathArray.length) return;
            obj[pathArray[index]] = index === pathArray.length-1 ? val : {};
            let temp: number = index;
            index++;
            getFinal(obj[pathArray[temp]]);
        };

        getFinal(finalObj);
        return finalObj
    }
}