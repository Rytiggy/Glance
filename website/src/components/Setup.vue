<template>
  <div class="setup q-py-xl">
    <div class="q-px-sm-none q-px-md-xl">
      <div class="text-white text-h3 text-center">Setup Guide</div>
      <div class="q-pb-md text-white text-center full-width">
        <div class="description-lead text-body1">
          Glance must not be used to make medical decisions, by using glance you
          agree to the
          <a
            href="https://github.com/Rytiggy/Glance/wiki/User-Agreement/"
            target="_blank"
            class="text-grey-10"
          >user agreement</a>.
        </div>
      </div>
      <q-stepper
        class="setup-stepper"
        flat
        bordered
        header-nav
        v-model="step"
        ref="stepper"
        color="primary"
        animated
      >
        <q-step class="text-center" :name="1" title="Start" icon="save_alt" :done="step > 1">
          <q-btn
            @click="$refs.stepper.next()"
            color="secondary"
            label="Start Setup Wizard"
            size="lg"
            unelevated
          />
        </q-step>
        <q-step :name="2" title="Install Glance" caption="Step 1" icon="save_alt" :done="step > 1">
          <div class="text-h5 text-grey-10 text-center">Install Glance</div>
          <div class="text-h6 text-grey-10">Step 1:</div>
          <div class="row q-pb-md">
            <div class="col-xs-12 col-sm-6 col-md-6">
              <span class="bullet">
                On your
                <b>phone</b> install Glance
              </span>
              <q-chip clickable square>
                <a
                  href="https://gallery.fitbit.com/details/7b5d9822-7e8e-41f9-a2a7-e823548c001c"
                  class="text-grey-10"
                  target="_blank"
                >
                  <q-avatar icon="save_alt" color="primary" text-color="white" />Download and install Glance
                </a>
              </q-chip>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-6">
              <q-img src="https://media.giphy.com/media/ul0NKnzGlOb8LL8bYe/giphy.gif" />
            </div>
          </div>
          <div class="full-width">
            <q-btn
              v-if="step > 1"
              flat
              color="primary"
              @click="$refs.stepper.previous()"
              label="Back"
              class="q-ml-sm"
              unelevated
            />
            <q-btn
              class="float-right"
              @click="$refs.stepper.next()"
              color="primary"
              label="Next"
              unelevated
            />
          </div>
        </q-step>

        <q-step
          :name="3"
          title="Select Data Source"
          caption="Step 2"
          icon="settings"
          :done="step > 2"
        >
          <div class="text-h5 text-grey-10 text-center">Select Data Source</div>
          <div class="text-h6 text-grey-10">Step 2:</div>
          <div class="text-subtext1">Select what data source you are going to be using:</div>
          <div class="row">
            <div
              v-for="(dataSoure, id) in dataSoures"
              :key="id"
              class="col-xs-12 col-sm-6 col-md-4 q-pa-sm"
            >
              <q-card
                v-ripple
                @click="selectDataSource(dataSoure)"
                flat
                bordered
                class="fit cursor-pointer"
              >
                <q-card-section>
                  <div class="text-h6 text-grey-10">{{ dataSoure.title }}</div>
                  <div class="text-subtitle1">{{ dataSoure.shortDescription}}</div>
                  <div v-for="(tag, t) in dataSoure.tags" :key="t" class="text-subtitle1 text-bold">
                    <q-badge class="text-weight-medium" color="primary">{{ tag.title }}</q-badge>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
          <q-btn
            v-if="step > 1"
            flat
            color="primary"
            @click="$refs.stepper.previous()"
            label="Back"
            class="q-ml-sm"
            unelevated
          />
        </q-step>

        <q-step
          :name="4"
          :disable="stepThreeDisable"
          title="Configure Settings"
          caption="Step 3"
          icon="settings"
        >
          <div v-if="selectedDataSouce != null">
            <div
              class="text-h5 text-grey-10 text-center"
            >Configure {{ selectedDataSouce.title }} Settings</div>
            <div class="text-h6 text-grey-10">Step 3:</div>
            <div
              class="text-subtext1"
            >Follow the steps below to setup your Glance settings for {{ selectedDataSouce.title }}:</div>
            <div class="text-subtitle1 text-bold">Requirements</div>
            <div v-for="(requirement, r) in selectedDataSouce.requirements" :key="r">
              <span class="bullet" v-html="requirement.title" />
            </div>
            <div class="text-subtitle1 text-bold">Steps</div>

            <div class="q-pb-md" v-for="(step, s) in selectedDataSouce.steps" :key="s">
              <div class="row" v-if="step.img != null">
                <div class="col-xs-12 col-sm-6 col-md-6">
                  <span class="bullet" v-html="step.title" />
                </div>
                <div class="col-xs-12 col-sm-6 col-md-6">
                  <q-img :src="step.img" />
                </div>
              </div>
              <div v-else class="row">
                <div class="col-xs-12 col-sm-12 col-md-12">
                  <span class="bullet" v-html="step.title" />
                </div>
              </div>
            </div>
          </div>
          <div class="full-width">
            <q-btn
              v-if="step > 1"
              flat
              color="primary"
              @click="$refs.stepper.previous()"
              label="Back"
              class="q-ml-sm"
              unelevated
            />
            <q-btn
              class="float-right"
              @click="$refs.stepper.next()"
              color="primary"
              label="Next"
              unelevated
            />
          </div>
        </q-step>

        <q-step :name="5" title="Review/Troubleshooting" icon="remove_red_eye">
          <div class="text-h5 text-grey-10 text-center">Finish</div>
          <div class="text-h6 text-grey-10">Review/Troubleshooting:</div>
          <div
            class="text-subtext1"
          >You should now be receiving BG data on your watchface! If you are not try the troubleshooting steps below.</div>
          <div class="q-pt-md text-h6 text-grey-10">Troubleshooting:</div>
          <span id="sync-issue-not-connecting" class="bullet">Sync Issue/Not connecting?</span>
          <q-carousel
            v-model="troubleshootingSlide"
            :fullscreen.sync="troubleshootingFullscreen"
            infinite
            class="bg-white"
          >
            <q-carousel-slide
              class="troubleshootSlide"
              :name="1"
              img-src="https://i.ibb.co/N1nmx40/Glance-Connection-issue-part-1-1.png"
            />

            <template v-slot:control>
              <q-carousel-control position="bottom-right" :offset="[18, 18]">
                <q-btn
                  push
                  round
                  dense
                  color="white"
                  text-color="primary"
                  :icon="troubleshootingFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                  @click="troubleshootingFullscreen = !troubleshootingFullscreen"
                />
              </q-carousel-control>
            </template>
          </q-carousel>
          <div class="text-h6 text-grey-10">Common Error Codes:</div>
          <div
            class="bullet"
          >DSE: Data Source error - generic error with <a
              class="text-primary"
              target="_blank"
              href="https://github.com/Rytiggy/Glance/wiki/How-to-configuring-Glance's-settings#datasource"
            >your data source
            </a> try opening Glance's settings
          </div>
          <div
            class="bullet"
          >E500: A very general HTTP status code that means something has gone wrong on your site's server but the server could not be more specific on what the exact problem is.</div>
          <div
            class="bullet"
          >E503: A HTTP status code that means the server is simply not available right now. Or you haven't configured your data source right.</div>
          <div class="bullet">E504: Gateway Timeout</div>
          <div class="bullet">E404: Could not locate your data source</div>
          <div class="q-pt-md text-h6 text-grey-10">Comunity Support:</div>
          <div class="bullet">
            <a
              class="q-px-sm text-primary"
              target="_blank"
              href="https://www.facebook.com/groups/Glance/"
            >
              Join Facebook Glance support group
            </a>
          </div>
          <div class="bullet">
            <a
              class="q-px-sm text-primary"
              target="_blank"
              href="https://discord.gg/RUa7U6F/"
            >
              Join Glance's Discord server
            </a>
          </div>
          <div class="full-width">
            <q-btn
              v-if="step > 1"
              flat
              color="primary"
              @click="$refs.stepper.previous()"
              label="Back"
              class="q-ml-sm"
              unelevated
            />
          </div>
        </q-step>
      </q-stepper>
    </div>
  </div>
</template>

<script>
export default {
  name: "setup",
  data() {
    return {
      stepThreeDisable: true,
      step: 1,
      selectedDataSouce: null,
      troubleshootingFullscreen: false,
      troubleshootingSlide: 1,
      dataSoures: [
        {
          title: "Dexcom",
          shortDescription:
            "Login using the master Dexcom account attached to the CGM",
          tags: [
            {
              title: "wifi/cell service"
            }
          ],
          requirements: [
            {
              title: "Dexcom transmitter with Share"
            },
            {
              title: "Master Dexcom login attached to the CGM"
            },
            {
              title:
                "Dexcom app receiving CGM data with Share enabled <a class='text-primary' href='https://www.dexcom.com/apps' target='_blank'>click to install the Dexcom app</a>"
            },
            {
              title: "Iphone or Android phone"
            },
            {
              title: "Glance watchface installed"
            }
          ],
          steps: [
            {
              title:
                "Assuming you have the Dexcom app installed and are receiving blood sugars on the Dexcom app. Navigate to the share triangle in the upper corner of the screen",
              img:
                "https://i.ibb.co/6rcTDdL/Inked51039956-2194388257289225-376444949962424320-n-LI.jpg"
            },
            {
              title:
                "Turn on sharing and add a follower. The follower can be yourself but you <b>need to have at least one follower!!</b>.",
              img:
                "https://i.ibb.co/DLyvT0x/Inked51231823-1020755888109881-3582069245317480448-n-LI.jpg"
            },
            {
              title:
                "After installing Glance, Navigate to Glance's settings. <br/> <span class='bullet'>Fitbit app => click the watch in the upper corner => clock faces => tap the watch => tap settings button at the bottom</span>",
              img: "https://media.giphy.com/media/4ZxdAQeUpXuFu8QsyV/giphy.gif"
            },
            {
              title:
                "In Glance's settings select `Dexcom` as your data source then enter your Dexcom `username` and `password`",
              img: "https://media.giphy.com/media/5h9xqgo3HaNzQ2bSC6/giphy.gif"
            },
            {
              title:
                "If you did everything right you should see your blood sugars on the watch.",
              img: "https://image.ibb.co/fbiG9U/versa-Ionic.png"
            }
          ]
        },
        {
          title: "Nightscout",
          shortDescription:
            "Uses your Nightscout site name to connect to your CGM data",
          tags: [
            {
              title: "wifi/cell service"
            }
          ],
          requirements: [
            {
              title:
                "A Nightscout site: <a class='text-primary' href='http://www.nightscout.info/wiki/welcome/set-up-nightscout-using-heroku' target='_blank'>How to setup a Nightscout site</a>"
            },
            {
              title: "Iphone or Android phone"
            },
            {
              title: "Glance watchface installed"
            }
          ],
          steps: [
            {
              title:
                "After installing Glance, Navigate to Glance's settings. <br/> <span class='bullet'>Fitbit app => click the watch in the upper corner => clock faces => tap the watch => tap settings button at the bottom</span>",
              img: "https://media.giphy.com/media/4ZxdAQeUpXuFu8QsyV/giphy.gif"
            },
            {
              title:
                "In Glance's settings select Nightscout as your data source then enter your Nightscout site name and select your Nightscout host site",
              img: "https://media.giphy.com/media/iNRFe1oGTOdkypd4o9/giphy.gif"
            },
            {
              title:
                "If you did everything right you should see your blood sugars on the watch.",
              img: "https://image.ibb.co/fbiG9U/versa-Ionic.png"
            }
          ]
        },
        {
          title: "Spike",
          shortDescription: "Use the Spike app to send CGM data to Glance",
          tags: [
            {
              title: "iPhone Only"
            }
          ],
          requirements: [
            {
              title:
                "The Spike app <a class='text-primary' href='https://spike-app.com/#installation' target='_blank'>Download Spike</a>"
            },
            {
              title: "An iPhone phone"
            },
            {
              title: "Glance watchface installed"
            }
          ],
          steps: [
            {
              title:
                "In the Spike app enable your internal web server by navigating to `Settings` => `integration` => `internal HTTP server` => `ON`  Click back to confirm the changes",
              img: null
            },
            {
              title:
                "After installing Glance, Navigate to Glance's settings `Fitbit app` => `click the watch in the upper corner` => `clock faces` => `tap the watch` => `tap settings button at the bottom`",
              img: "https://media.giphy.com/media/4ZxdAQeUpXuFu8QsyV/giphy.gif"
            },
            {
              title: "In Glance's settings select `Spike` as your data source.",
              img: null
            },
            {
              title:
                "If you did everything right you should see your blood sugars on the watch.",
              img: "https://image.ibb.co/fbiG9U/versa-Ionic.png"
            }
          ]
        },
        {
          title: "xDrip",
          shortDescription: "Use the xDrip app to send CGM data to Glance",
          tags: [
            {
              title: "Android Only"
            }
          ],
          requirements: [
            {
              title:
                "The xDrip+ app <a class='text-primary' href='https://jamorham.github.io/#xdrip-plus' target='_blank'>Download xDrip+</a>"
            },
            {
              title: "An Android phone"
            },
            {
              title: "Glance watchface installed"
            }
          ],
          steps: [
            {
              title:
                "In the xDrip+ app enable your local web service by navigating to Settings -> Inter-App settings -> xDrip Web Service -> ON",
              img: null
            },
            {
              title:
                "After installing Glance, Navigate to Glance's settings. <br/> <span class='bullet'>Fitbit app => click the watch in the upper corner => clock faces => tap the watch => tap settings button at the bottom</span>",
              img: "https://media.giphy.com/media/4ZxdAQeUpXuFu8QsyV/giphy.gif"
            },
            {
              title:
                "In Glance's settings select `xDrip+` as your data source.",
              img: null
            },
            {
              title:
                "If you did everything right you should see your blood sugars on the watch.",
              img: "https://image.ibb.co/fbiG9U/versa-Ionic.png"
            }
          ]
        },
        {
          title: "Tomato",
          shortDescription: "Use the Tomato app to send CGM data to Glance",
          tags: [
            {
              title: "Currently only working on Android"
            }
          ],
          requirements: [
            {
              title:
                "The Tomato app <a class='text-primary' href='http://tomato.cool/' target='_blank'>Download Tomato</a>"
            },
            {
              title: "An Android phone"
            },
            {
              title: "Glance watchface installed"
            }
          ],
          steps: [
            {
              title:
                "In the Tomato app enable your local HTTP server by navigating to Settings -> Inter-App settings -> xDrip Web Service -> ON",
              img: "../statics/tomato1.jpg"
            },
            {
              title: "enable your local HTTP server",
              img: "../statics/tomato2.jpg"
            },
            {
              title:
                "If you did everything right you should see your blood sugars on the watch.",
              img: "https://image.ibb.co/fbiG9U/versa-Ionic.png"
            }
          ]
        },
        {
          title: "Custom",
          shortDescription:
            "Use a custom data source, works well for custom nightscout site",
          tags: [],
          requirements: [
            {
              title: "API endpoint with HTTPS enabled"
            }
          ],
          steps: [
            {
              title:
                "Select custom as your data source and enter your custom URL to your API's CGM data",
              img: null
            },
            {
              title:
                "Example data endpoint <a class='text-primary' target='_blank' href='https://glancedata.herokuapp.com/pebble'>https://glancedata.herokuapp.com/pebble</a>",
              img: null
            }
          ]
        }
      ]
    };
  },
  watch: {
    step: (newVal, oldVal) => {
      if (this.selectedDataSouce != null) {
        return newVal;
      }
      return oldVal;
    }
  },
  methods: {
    // Prams: name
    // set setupTabs to selected data source
    selectDataSource(dataSource) {
      this.stepThreeDisable = false;
      this.selectedDataSouce = dataSource;
      setTimeout(() => {
        this.step = 4;
      }, 250);
    }
  }
};
</script>

<style>
.setup {
  background: linear-gradient(
      rgba(75, 162, 220, 1.9) 100%,
      rgba(75, 162, 220, 1.9) 100%
    ),
    url("../statics/dark-paths.png");
  background-repeat: repeat;
}
.setup-stepper {
  max-width: 950px;
  margin: auto;
}
.bullet {
  display: list-item;
  list-style-type: disc;
  list-style-position: inside;
}
.troubleshootSlide {
  background-size: contain !important;
  background-repeat: no-repeat;
}
</style>
