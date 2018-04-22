# Glance ![twerp logo](https://image.ibb.co/gbWF2H/twerp_bowtie_64.png)
Glance is a solution for use with Fitbit devices to view your blood glucose levels along with a variety of other health stats on the watch face. You can see your stats at a glance!
### Interface 
![ionic and versa](https://image.ibb.co/g7u5Bx/ionic_and_versa.png "ionic and versa")

### Alert 
![alert](https://image.ibb.co/eRBVdc/alert.png "alert")
### Settings 
![settings](https://image.ibb.co/i90WJc/settings.png "settings")

## Features 
- Current BG
- Trend direction
- Delta 
- Time sense last pull (syncd with device)
- Graph of BG's over time
- Error reporting
- Temperature (requires API token from https://openweathermap.org/) 
- Step count
- Heart rate
- Time
- Date
- Battery levels
- Vibration Alerts 
## Instructions For Use
### User setup
- On your phone go to the [published version of Glance](https://gam.fitbit.com/gallery/clock/7b5d9822-7e8e-41f9-a2a7-e823548c001c) And click the Select button. 
  - if you have the dev environment on the phone set up, delete the version of glance under developer menu
- You will need to configure your settings of the watch face 
  - API endpoint
  - weather API key from https://openweathermap.org/
  - location (city)
- After the settings are set up you should now be able to see the blood sugars on the watch.

### Dev environment setup
- Follow this step by step guide for development:
  - https://github.com/Rytiggy/Glance/blob/master/HowToInstall.md
## Requirements 
- CGM data on a cloud service ( e.g. xdrip, nightscout, Spike ). 
- JSON data similar to this
```
sgv: 
delta:  
units_hint: 
```
- Open Weather Map API key (https://openweathermap.org/)
## Resources / QA
- What is an API endpoint?
  - An API endpoint is a unique URL that represents your data.
- How do I use it with the watch? 
  - If you are using **xDrip** 
    - Navigate to `Settings` -> `Inter-App settings` -> `xDrip Web Service` -> `ON` 
    - Point the watch face to the following URL (API Endpoint): `http://127.0.0.1:17580/sgv.json`
  - If you are using **NightScout** you can follow [these steps](http://www.nightscout.info/wiki/welcome/set-up-nightscout-using-heroku)
  - If you are using **Spike**  
    - Activate internal server in `Settings` -> `integration` -> `internal HTTP server` -> `ON` click back to confirm the changes.
    - Point the watch face to the following URL (API Endpoint): `http://127.0.0.1:1979/sgv.json`
- How do I get an Open Weather Map API key?
   - To get the weather you need to go to https://openweathermap.org/appid and sign up
   - After you sign up you should be able to view your API key under your account page on open weather maps
   - Then just add your API key to glance's settings

## License
- `GPL v3`
- `Commercial License` contact me for details
## User Agreement 
Glance must not be used to make medical decisions
