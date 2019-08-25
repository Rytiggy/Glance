<template>
  <q-page padding>
    <div class="description-lead q-py-xl">
      <div class="text-h3 text-center q-pb-xs">Customize Glance</div>
      <div class="text-subtext1 text-center q-pb-md">
        Glance has a very dynamic set of settings allowing it to be used in a
        variety of different use cases. below are the settings that you can
        change to your liking.
      </div>
      <div class="text-h6 text-grey-10">Settings glossary/key</div>
      <ul class="q-mt-none">
        <li>
          <span class="text-subtitle1 text-bold">Data Source:</span> Where your
          blood sugars are being hosted in the cloud.
          <ul>
            <li>
              <a
                class="text-primary"
                href="https://github.com/Rytiggy/Glance/wiki/How-to-setup-Dexcom-as-a-data-source"
                >Dexcom</a
              >
              <ul>
                <li>Username: Your dexcom username</li>
                <li>Password: your dexcom password</li>
                <li>
                  International: Toggle to switch between international (not in
                  USA) share server and national share server
                </li>
              </ul>
            </li>
            <li>
              <a
                class="text-primary"
                href="https://github.com/Rytiggy/Glance/wiki/How-to-setup-Nightscout-as-a-data-source"
                >Nightscout</a
              >
              <ul>
                <li>
                  Site name: Nighscout app name or nightscout URL both will work
                  in 2.2
                </li>
                <li>
                  Acceptable formates
                  <ul>
                    <li>
                      <a
                        class="text-primary"
                        href="https://SiteName.herokuapp.com"
                        >https://SiteName.herokuapp.com</a
                      >
                    </li>
                    <li>SiteName</li>
                  </ul>
                </li>
                <li>
                  Nightscout host site: Where you're nightscout site is hosted
                  at. Heroku or Azure.
                </li>
              </ul>
            </li>
            <li>
              <a
                class="text-primary"
                href="https://github.com/Rytiggy/Glance/wiki/How-to-setup-xDrip--as-a-data-source"
                >xDrip+</a
              >
            </li>
            <li>
              <a
                class="text-primary"
                href="https://github.com/Rytiggy/Glance/wiki/How-to-setup-Spike-as-a-data-source"
                >Spike</a
              >
            </li>
            <li>
              Tomato
            </li>
            <li>
              Custom
              <ul>
                <li>
                  a custom api URL with data formatted similar to nightscout
                </li>
              </ul>
            </li>
          </ul>
        </li>

        <li>
          <span class="text-subtitle1 text-bold">Glucose Units:</span> The unit
          type you are in <code>mgdl</code> or <code>mmol</code>
        </li>

        <li>
          <span class="text-subtitle1 text-bold">High threshold:</span> The
          limit when the high alert will fire
        </li>

        <li>
          <span class="text-subtitle1 text-bold">Low threshold:</span> The limit
          when the low alert will fire
        </li>

        <li>
          <span class="text-subtitle1 text-bold">Disable Alerts:</span> Disable
          all alerts
        </li>

        <li>
          <span class="text-subtitle1 text-bold">Extra glucose settings:</span>
          Advanced glucose settings handling settings that don't normally need
          changed
        </li>

        <li>
          <span class="text-subtitle1 text-bold">High alerts:</span> alert to
          high blood sugars when blood sugar is above high threshold
        </li>

        <li>
          <span class="text-subtitle1 text-bold"
            >Dismiss high alerts for n minutes:</span
          >
          How long to dismiss the high alert for after user dismissal.
        </li>

        <li>
          <span class="text-subtitle1 text-bold">Low alerts:</span> alert to low
          blood sugars when blood sugar is below low threshold
        </li>

        <li>
          <span class="text-subtitle1 text-bold"
            >Dismiss low alerts for n minutes:</span
          >
          How long to dismiss the low alert for after user dismissal.
        </li>

        <li>
          <span class="text-subtitle1 text-bold">Rapid rise alerts:</span> Alert
          to rapid rises in blood sugars (double up)
        </li>

        <li>
          <span class="text-subtitle1 text-bold">High threshold:</span>
          <p>
            <a>**Rapid fall alerts:**</a> Alert to rapid falls in blood sugars
            (double down)
          </p>
        </li>

        <li>
          <span class="text-subtitle1 text-bold">Loop status alerts:</span>
          Alert when loop status is in warning state
        </li>

        <li>
          <span class="text-subtitle1 text-bold">Stale date alerts:</span> Alert
          when data is more then 25 minutes old.
        </li>

        <li>
          <span class="text-subtitle1 text-bold"
            >Stale data alerts after n minutes:</span
          >
          How long to wait before alerting to stale data
        </li>

        <li>
          <span class="text-subtitle1 text-bold"
            >Dismiss alarm when back in range:</span
          >If alert was fired in the last n minutes (based on users alert times)
          but blood sugar goes within thresholds during that time. allow another
          alert to be fired if threshold is met.
        </li>

        <li>
          <span class="text-subtitle1 text-bold">Time format:</span> A time
          format to display time in 24 or 12 hours
        </li>

        <li>
          <span class="text-subtitle1 text-bold">Date format:</span> A date
          formate based on users preference
        </li>

        <li>
          <span class="text-subtitle1 text-bold"
            >Day of week at end of date:</span
          >Adds day of week to end of date
        </li>

        <li>
          <span class="text-subtitle1 text-bold">Main Graph Predictions:</span>
          Enable predictions on main graph (note this is only available if you
          have it enabled on your end points)
        </li>

        <li>
          <span class="text-subtitle1 text-bold"
            >Large graph popup screen:</span
          >
          Adds a more detailed large graph pop screen. to open and close the
          large graph tap the graph in the lower right hand corner
          <ul>
            <li>
              <img
                src="https://media.giphy.com/media/1WbRR9FSE6WhYxaPIP/giphy.gif"
                width="200px"
              />
            </li>
          </ul>
        </li>

        <li>
          <p>
            <a>**Background color:**</a> Select a color for the watch background
          </p>
          <ul>
            <li>
              The white circle color is used for randomly generating a color.
              you can also enter
              <a class="text-primary" href="https://www.color-hex.com/"
                >hex values</a
              >
              for any color.
              <ul>
                <li>
                  <strong>Hex Color One:</strong> A hex color code that is used
                  for the top background color on the watch
                </li>
                <li>
                  <strong>Hex Color Two:</strong> A hex color code that is used
                  for the bottom background color on the watch
                </li>
                <li>
                  <strong>Text Color:</strong> A hex color code that is used for
                  changing the text color on the watch
                </li>
              </ul>
            </li>
          </ul>
        </li>

        <li>
          <span class="text-subtitle1 text-bold">Customize:</span> The layouts
          are used to change the default values with other ones present from
          your data source.(currently only working for nightscout)
        </li>
      </ul>
    </div>
  </q-page>
</template>

<script>
export default {
  data() {
    return {};
  }
};
</script>
<style></style>
