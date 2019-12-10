<template>
  <div>
    <div class="glance-header q-py-xl">
      <div class="q-pa-xl">
        <div class="q-pb-md text-white text-center full-width">
          <div class="description-lead text-body1">
            <div class="full-width text-center">
              <q-avatar size="200px">
                <img src="../statics/logo.png" />
              </q-avatar>
            </div>

            <div class="text-h3 text-weight-medium text-white">Glance</div>
            <div class="text-h6 text-weight-normal text-white">
              A project to help manage diabetes
            </div>
            <div class="q-mt-md">Downloads</div>
            <div class="row downloads">
              <div class="col-6">
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
                    />
                    Stable Glance
                  </a>
                </q-chip>
                <div class="text-caption text-white q-mb-xs">
                  Version: 2.1.112
                </div>
              </div>
              <div class="col-6">
                <q-chip clickable square>
                  <a
                    @click="betaDialog = true"
                    class="text-grey-10"
                    target="_blank"
                  >
                    <q-avatar
                      icon="save_alt"
                      color="primary"
                      text-color="white"
                    />
                    Beta Glance
                  </a>
                </q-chip>
                <div class="text-caption text-white q-mb-xs">Early access</div>
              </div>
            </div>
            <!-- Beta dialog -->
            <q-dialog v-model="betaDialog">
              <q-card>
                <q-toolbar>
                  <q-toolbar-title>
                    <q-avatar>
                      <img src="../statics/favicon.png" />
                    </q-avatar>
                    <span class="gt-xs text-h5 glance-logo">Glance</span>
                  </q-toolbar-title>

                  <q-btn flat round dense icon="close" v-close-popup />
                </q-toolbar>

                <q-card-section class="text-body1">
                  You are about to download the beta version of Glance. Please
                  keep in mind it is a pre-released version and can be unstable.
                  You may encounter bugs and unexpected crashes.
                </q-card-section>

                <q-card-actions align="right" class="text-primary">
                  <q-btn color="secondary" flat label="Cancel" v-close-popup />
                  <q-btn
                    v-close-popup
                    type="a"
                    href="https://gam.fitbit.com/gallery/clock/f89ff99d-4365-4a39-aa2f-f66aaa970587"
                    target="__blank"
                    flat
                    color="primary"
                    label="Download Beta"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      betaDialog: false
    };
  },
  methods: {
    OpenModelBeta() {}
  }
};
</script>

<style>
/* .glance-header {
  height: calc(100vh - 150px);
} */
.glance-header {
  background: linear-gradient(
      rgba(34, 34, 34, 0.95) 100%,
      rgba(34, 34, 34, 0.96) 100%
    ),
    url("../statics/header.jpg");
  background-position: bottom;
  background-repeat: no-repeat;
}

.downloads {
  max-width: 320px;
  margin: auto;
}
</style>
