<template>
  <div id="features" class="q-py-xl">
    <div class="q-pa-xl">
      <div class="text-white text-h3 text-center">Features</div>
      <div class="q-pb-md text-white text-center full-width">
        <div class="description-lead text-body1">
          Glance is a watchface for use with Fitbit devices to view your blood
          glucose levels along with a variety of other health stats on the watch
          face. You can see your stats at a glance!
        </div>
      </div>
      <div class="row">
        <div class="col-xs-12 col-sm-6 col-md-4">
          <q-card flat bordered square class="features-card fit">
            <q-card-section class="text-center">
              <div class="text-h3">
                <i class="fas fa-tint"></i>
              </div>
              <div class="text-h5 text-weight-medium">Current BG</div>
              <div class="text-subtitle1 text-weight-normal">
                Receive blood glucose readings every 5 minutes.
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-xs-12 col-sm-6 col-md-4">
          <q-card flat bordered square class="features-card fit">
            <q-card-section class="text-center">
              <div class="text-h3">
                <i class="fas fa-exclamation"></i>
              </div>
              <div class="text-h5 text-weight-medium text-center">
                Vibration Alerts
              </div>
              <div class="text-subtitle1 text-weight-normal">
                Vibrates to alert you when your blood glucose falls below or
                rises above your high or low thresholds.
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-xs-12 col-sm-6 col-md-4">
          <q-card flat bordered square class="features-card fit">
            <q-card-section class="text-center">
              <div class="text-h3">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="text-h5 text-weight-medium">Trend Direction</div>
              <div class="text-subtitle1 text-weight-normal">
                See a graph of trend data for the last 4 hours to better predict
                where your blood glucose is heading.
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-xs-12 col-sm-6 col-md-4">
          <q-card flat bordered square class="features-card fit">
            <q-card-section class="text-center">
              <div class="text-h3">
                <i class="fas fa-palette"></i>
              </div>
              <div class="text-h5 text-weight-medium">Customizations</div>
              <div class="text-subtitle1 text-weight-normal">
                Customize Glance how you like it, change the background color,
                unit type (mgdl or mmol), various alerts you want to recieve,
                and so much more!
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-xs-12 col-sm-6 col-md-4">
          <q-card flat bordered square class="features-card fit">
            <q-card-section class="text-center">
              <div class="text-h3">
                <i class="fas fa-cloud"></i>
              </div>
              <div class="text-h5 text-weight-medium">Data Source Options</div>
              <div class="text-subtitle1 text-weight-normal">
                Select from a variety of data sources, including <b>Dexcom</b>,
                <b>Nightscout</b>, <b>Spike</b>, <b>xDrip</b> and <b>Tomato</b>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-xs-12 col-sm-6 col-md-4">
          <q-card flat bordered square class="features-card fit">
            <q-card-section class="text-center">
              <div class="text-h3">
                <i class="fas fa-puzzle-piece"></i>
              </div>
              <div class="text-h5 text-weight-medium">Compatibility</div>
              <div class="text-subtitle1 text-weight-normal">
                Glance is compatible with Fitbit smartwatchs that includes the
                Fitbit <b>Versa</b>, <b>Versa lite</b>, and <b>Ionic</b>.
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
#features {
  background: linear-gradient(
      rgba(75, 162, 220, 0.9) 100%,
      rgba(75, 162, 220, 0.9) 100%
    ),
    url("../statics/bg.jpg");
}
.features-card {
  background: rgb(75, 162, 220);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}
</style>
