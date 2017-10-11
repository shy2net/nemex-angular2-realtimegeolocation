# Nemex Angular 2+ Realtime Geolocation Server

This service allows you to obtain realtime GPS locations within Angular 2+.

Note: Chrome and Safari requires the device connection to be over SSL (https://), make sure to
debug and use SSL on your producation for this to work.

## Installation

Install the package using the following command:
> npm install nemex-angular2-realtimegeolocation

In your app module add the follwing code:
```typescript
...
import { RealtimeGeolocationService } from 'nemex-angular2-realtimegeolocation';

@NgModule({
  ...
  // Import the service in order to use it within your app
  providers: [
    ...
    RealtimeGeolocationService
  ],
  ...
})
```

## Usage

In order to obtain the device locations you must import the RealtimeGeolocation service in your app and into your component.

After that you need to use the start() method to obtain new locations.
If you would like to stop, simply call the stop() method.

Here is an example of a map component which shows the current coordinates of the user (updated by intervals of 300 milliseconds):
```typescript
import { Component, OnInit, Input } from '@angular/core';
import { RealtimeGeolocationService } from 'nemex-angular2-realtimegeolocation';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  currentLocation:Coordinates = null;

  constructor(private locationService:RealtimeGeolocationService) { }

  ngOnInit() {
    try {  
        // Start obtaining realtime location when map component loads
        this.locationService.refreshInterval = 300;
        this.locationService.start(); 

        // Update the location on the map according to the current position of the user
        this.locationService.getLocationObservable().subscribe(position => {
        this.currentLocation = position.coords;
        }, error => {
        // Usually called because of permission issues or an error obtaining the last position
        alert(error.message);
        });
    } catch(error) {
      // This error is usually called when device does not support geolocation at all
      alert(error);
    }
  }
}
```

## Service options
The realtime geolocation service allows you to edit some of it's capabilities easily.

- **refreshInterval** - The time (in milliseconds) between each user location updates. by default 1000.
- **locationOptions** - The options delivered to the window.navigator.geolocation.getCurrentPosition. By default set to:
```typescript
{ enableHighAccuracy: true }; 
 ```
 - **listening** - Returns true if location is still being listened to.

Instead of using a subscriber to get the location updates, you can register a callback to obtain the new positions:
```typescript
this.locationService.onLocationObtained.subscribe(position => {
    // We have got a new position!
});

this.locationService.onLocationError.subscribe(error => {
    // An error had occured while trying to get the last position
});
```