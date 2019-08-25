<template>
  <div id="setup" class="q-py-xl">
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
            >user agreement</a
          >.
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
        :vertical="$q.screen.lt.md"
      >
        <q-step
          class="text-center"
          :name="1"
          title="Start"
          icon="save_alt"
          :done="step > 1"
        >
          <div class="text-subtext1 q-pb-sm">
            This guide will walk you through getting your CGM data to display on
            Glance.
          </div>
          <q-btn
            @click="$refs.stepper.next()"
            color="secondary"
            label="Start Setup Wizard"
            size="lg"
            unelevated
          />
        </q-step>
        <q-step
          :name="2"
          title="Install Glance"
          caption="Step 1"
          icon="save_alt"
          :done="step > 1"
        >
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
                  href="https://glance.page.link/download"
                  class="text-grey-10"
                  target="_blank"
                >
                  <q-avatar
                    icon="save_alt"
                    color="primary"
                    text-color="white"
                  />Download and install Glance
                </a>
              </q-chip>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-6">
              <q-img
                src="https://media.giphy.com/media/ul0NKnzGlOb8LL8bYe/giphy.gif"
              />
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
          <div class="text-subtext1">
            Select what data source you are going to be using:
          </div>
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
                  <div class="text-subtitle1">
                    {{ dataSoure.shortDescription }}
                  </div>
                  <spn
                    v-for="(tag, t) in dataSoure.tags"
                    :key="t"
                    class="text-subtitle1 text-bold q-pr-sm"
                  >
                    <q-badge
                      class="text-weight-medium"
                      :class="tag.textColor"
                      :color="tag.color"
                      >{{ tag.title }}</q-badge
                    >
                  </spn>
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
            <div class="text-h5 text-grey-10 text-center">
              Configure {{ selectedDataSouce.title }} Settings
            </div>
            <div class="text-h6 text-grey-10">Step 3:</div>
            <div class="text-subtext1">
              Follow the steps below to setup your Glance settings for
              {{ selectedDataSouce.title }}:
            </div>
            <div class="text-subtitle1 text-bold">Requirements</div>
            <div
              v-for="(requirement, r) in selectedDataSouce.requirements"
              :key="r"
            >
              <span class="bullet" v-html="requirement.title" />
            </div>
            <div class="text-subtitle1 text-bold">Steps</div>

            <div
              class="q-pb-md"
              v-for="(step, s) in selectedDataSouce.steps"
              :key="s"
            >
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

        <q-step :name="5" title="Review" icon="remove_red_eye">
          <div class="text-h5 text-grey-10 text-center">Finish</div>
          <div class="text-h6 text-grey-10">Review:</div>
          <div class="text-subtext1">
            You should now be receiving BG data on your watchface!
          </div>
          <div class="q-pt-md text-h6 text-grey-10">Customize Glance:</div>
          <div class="bullet">
            Glance has a very dynamic set of settings allowing it to be used in
            a variety of different use cases. Customize Glance how you like it,
            change the background color, unit type (mgdl or mmol), various
            alerts you want to recieve, and so much more!
          </div>
          <div class="bullet">
            <q-btn
              flat
              no-caps
              type="a"
              to="/customize"
              class="text-primary text-weight-regular"
              >Check out the Customization section</q-btn
            >
          </div>
          <div class="q-pt-md text-h6 text-grey-10">Need help:</div>
          <div class="bullet">
            <q-btn
              flat
              no-caps
              type="a"
              to="/troubleshooting"
              class="text-primary text-weight-regular"
              >Check out the troubleshooting section</q-btn
            >
          </div>
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
          <div class="bullet">
            <a
              class="q-px-sm text-primary"
              target="_blank"
              href="https://www.youtube.com/watch?v=3rNK4goaVUE"
            >
              Video walkthrough: How to setup Glance
            </a>
            made by Type1Tech TipsnTricks
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
      dataSoures: [
        {
          title: "Dexcom",
          shortDescription:
            "Login using the master Dexcom account attached to the CGM",
          tags: [
            {
              title: "Requires: wifi",
              color: "warning",
              textColor: "text-grey-10"
            },
            {
              title: "Requires: cell service",
              color: "warning",
              textColor: "text-grey-10"
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
              title: "Glance watchface installed on your phone"
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
              title: "Requires: wifi",
              color: "warning",
              textColor: "text-grey-10"
            },
            {
              title: "Requires: cell service",
              color: "warning",
              textColor: "text-grey-10"
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
              title: "Glance watchface installed on your phone"
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
              title: "iPhone Only",
              color: "primary",
              textColor: "text-white"
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
              title: "Glance watchface installed on your phone"
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
              img: "https://media.giphy.com/media/JPyxgMeXoifbn34HiK/giphy.gif"
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
              title: "Android Only",
              color: "primary",
              textColor: "text-white"
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
              title: "Glance watchface installed on your phone"
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
              img: "https://media.giphy.com/media/XbIhFmEJQcawNIUgIl/giphy.gif"
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
              title: "Currently only working on Android",
              color: "primary",
              textColor: "text-white"
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
              title: "Glance watchface installed on your phone"
            }
          ],
          steps: [
            {
              title:
                "In the Tomato app enable your local HTTP server by navigating to Settings -> Inter-App settings -> xDrip Web Service -> ON",
              img: "../statics/tomato1.jpg"
            },
            {
              title: "Enable Tomatos local HTTP server",
              img: "../statics/tomato2.jpg"
            },
            {
              title:
                "After installing Glance, Navigate to Glance's settings. <br/> <span class='bullet'>Fitbit app => click the watch in the upper corner => clock faces => tap the watch => tap settings button at the bottom</span>",
              img: "https://media.giphy.com/media/4ZxdAQeUpXuFu8QsyV/giphy.gif"
            },
            {
              title:
                "In Glance's settings select `Tomato` as your data source.",
              img: "https://media.giphy.com/media/RIRTkpyiAS2cKZOGxi/giphy.gif"
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
#setup {
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
.troubleshootSlide {
  background-size: contain !important;
  background-repeat: no-repeat;
}
</style>
