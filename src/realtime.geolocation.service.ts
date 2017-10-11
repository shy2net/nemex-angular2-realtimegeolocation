import { observable } from 'nemex-angular2-realtimegeolocation/node_modules/rxjs/symbol/observable';
import { Injectable, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class RealtimeGeolocationService {
    @Output() public onLocationObtained = new EventEmitter<Position>();
    @Output() public onLocationError = new EventEmitter<PositionError>();

    // The number of milliseconds to refresh the location
    public refreshInterval: number = 1000;
    public locationOptions: PositionOptions = { enableHighAccuracy: true };
    public get listening(): boolean { return this.isListening; }

    private isListening: boolean = false;
    private refreshTimer = null;
    private lastPositionTime: number = 0;
    private locationObservable: Observable<Position> = null;

    // Starts listening to location changes
    start(): void {
        if (!window.navigator || !window.navigator.geolocation)
            throw new Error("This browser does not support geolocation!");

        if (this.isListening)
            throw new Error("Location is already being listened to!");

        this.isListening = true;
        this.locationObservable = new Observable<Position>(observer => {
            this.obtainNextPosition(observer);
        });

        // Calling subscribe allows us to trigger the observable
        this.locationObservable.subscribe();
    }

    // Returns the current position async
    getCurrentPosition(): Observable<Position> {
        return new Observable(observer => {
            window.navigator.geolocation.getCurrentPosition(
                (position) => {
                    observer.next(position);
                    observable.complete();
                },
                (error) => {
                    observer.error(error);
                    observer.complete();
                }
            )
        });
    }

    // Obtains the next position async, and then schedules the next position obtainment
    private obtainNextPosition(observer): void {
        if (!this.isListening) return;
        this.lastPositionTime = Date.now();

        window.navigator.geolocation.getCurrentPosition(
            (position) => {
                this.onLocationObtained.emit(position);
                observer.next(position);
                this.scheduleNextPositionCall(observer);
            },
            (error) => {
                this.onLocationError.emit(error);
                observer.error(error);

                switch (error.code) {
                    case 1:
                        // Position denied error
                        observer.complete();
                        this.stop();
                        return;
                    case 2:
                        // Position unavilable

                        break;
                    case 3:
                        // Position timed out

                        break;
                }

                this.scheduleNextPositionCall(observer);
            }

            , this.locationOptions)
    }

    // Schedules the next call to obtain the position, used the refreshInterval - deltaTime (the last we have obtained a position)
    private scheduleNextPositionCall(observer): void {
        let currentTime = Date.now();
        let deltaTime = currentTime - this.lastPositionTime;
        let scheduledMillis = Math.max(this.refreshInterval - deltaTime, 0);

        this.refreshTimer = setTimeout(() => {
            this.obtainNextPosition(observer);
        }, scheduledMillis);
    }

    stop(): void {
        this.isListening = false;
        if (this.refreshTimer) clearTimeout(this.refreshTimer);
        this.locationObservable = null;
        this.refreshTimer = null;
    }

    // Returns an obseravble containing data about the positions of the user, you must call start() before using this method
    getLocationObservable(): Observable<Position> {
        if (!this.locationObservable) throw Error("start() has not been called or device location\\permission error!");
        return this.locationObservable;
    }
}