import * as redisLib from 'redis';
import { Observable } from 'rxjs';

export class Redis {
    private _config: redisLib.ClientOpts;
    private _client: redisLib.RedisClient;
    private _listeners: Function;

    public connect (): Observable<redisLib.RedisClient> {
        if (!this._config) {
            return Observable.throw(new Error('Could not create redis client, config does not exist.'));
        }

        this._client = redisLib.createClient(this._config);
        
        if (this._listeners) {
            this._listeners();
        } else {
            this.defaultConnectionListeners();
        }

        return Observable.of(this._client);
    }

    private defaultConnectionListeners () {
        this._client.on('error', (err) => console.error(`Error: ${err}`));
        this._client.on('ready', () => console.log('Connected to Redis'));
        this._client.on('reconnecting', (details) => {
            console.log('Attempting to reconnect to redis...')
            console.log(`Delay: ${details.delay}`);
            console.log(`Attempt: ${details.attempt}`);
        });
        this._client.on('end', () => console.log('Disconnected from Redis'));
    }

    public set (key: string, value: string): Observable<string> {
        return Observable.fromPromise(
            new Promise((resolve, reject) => {
                this._client.set(key, value, (err, response) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve(response);
                })
            })
        )
    }

    public hset (hash: string, field: string, value: string): Observable<number> {
        return Observable.fromPromise(
            new Promise((resolve, reject) => {
                this._client.hset(hash, field, value, (err, response) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve(response);
                });
            })
        );
    }

    public HMSET (hash: string, object: {[key: string]: string | number}): Observable<boolean> {
        return Observable.fromPromise(
            new Promise((resolve, reject) => {
                this._client.HMSET(hash, object, (err, response) => {
                    if (err) {
                        return reject(err);
                    }
                    
                    resolve(response);
                });
            })
        )
    }

    public get (key: string): Observable<string> {
        return Observable.fromPromise(
            new Promise((resolve, reject) => {
                this._client.get(key, (err, response) => {
                    if (err) {
                        return reject(err);
                    }
                    
                    resolve(response);
                });
            })
        )
    }

    public hget (hash: string, field: string): Observable<string> {
        return Observable.fromPromise(
            new Promise((resolve, reject) => {
                this._client.hget(hash, field, (err, response) => {
                    if (err) {
                        return reject(err);
                    }
                    
                    resolve(response);
                });
            })
        )
    }

    public hgetall (hash: string): Observable<{[key: string]: string}> {
        return Observable.fromPromise(
            new Promise((resolve, reject) => {
                this._client.hgetall(hash, (err, response) => {
                    if (err) {
                        return reject(err);
                    }
                    
                    resolve(response);
                });
            })
        )
    }

    set config (config: redisLib.ClientOpts) {
        this._config = config;
    }

    set listeners (listeners: Function) {
        this._listeners = listeners;
    }
}

export const redis = new Redis();
