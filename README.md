# Glance ![twerp logo](https://image.ibb.co/gbWF2H/twerp_bowtie_64.png)
Glance is a solution for use with Fitbit devices to view your blood glucose levels along with a variety of other health stats on the watch face. You can see your stats at a glance!
### Interface 
![ionic and versa](https://image.ibb.co/d4JNKd/ionic_and_versa.png "ionic and versa")

### Alert 
![alert](https://image.ibb.co/eRBVdc/alert.png "alert")
### Settings 
![settings](https://image.ibb.co/d8224d/step_2.png "settings")

## Features 
- Current BG
- Trend direction
- Delta 
- Time sense last pull 
- Graph of BG's over time
- Error reporting
- Temperature 
- Step count
- Heart rate
- Time
- Date
- Battery levels
- Vibration Alerts 
- Changing background color

## Instructions For Use
### User setup guide
- **Before you start!** you must have your bloodsugars accessable through a URL. (Examples include [xDrip+](https://github.com/jamorham/xDrip-plus), [Nightscout](http://www.nightscout.info/wiki/welcome/set-up-nightscout-using-heroku), [Spike](https://spike-app.com/) )
- Starting on your Phone navigate to the [Latest version of Glance](https://gam.fitbit.com/gallery/clock/7b5d9822-7e8e-41f9-a2a7-e823548c001c) And click the **Select button**. Then click **install**. 
- ![step 1](https://image.ibb.co/f7SKjd/step_1.png)
- After the installation has finished open the **fitbit** app and navigate to **clock faces** then click the **green gear** to access **Glance's settings**.
- ![step 2](https://image.ibb.co/jQzkqJ/step.png)
- Once in Glance's settings, Go through each input and fill them out.
  - Api Endpoint (URL where your bloodsugars are accessable)
  - High and low thresholds 
  - Glucose units (mgdl / mmol)
  - Date format
  - Location 
- ![step 3](https://image.ibb.co/d8224d/step_2.png)
- After entering the above mentioned settings you should be able to see the blood sugars on the watch! 








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

## License
- `GPL v3`
- `Commercial License` contact me for details
## User Agreement 
Glance must not be used to make medical decisions
