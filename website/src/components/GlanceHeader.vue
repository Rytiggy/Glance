<template>
  <!-- <div class="relative-position glance-header">
    <q-parallax class="dimmed full-height" :speed="2" src="../statics/header.jpg"></q-parallax>
    <div class="absolute-center text-center">
      <div class="full-width text-center">
        <q-avatar size="200px">
          <img src="../statics/logo.png">
        </q-avatar>
      </div>

      <div class="text-h3 text-weight-medium text-white">Glance</div>
      <div
        class="text-h6 text-weight-normal text-white"
      >A project to help manage diabetes</div>
      <q-chip clickable square>
        <a
          href="https://gallery.fitbit.com/details/7b5d9822-7e8e-41f9-a2a7-e823548c001c"
          class="text-grey-10"
          target="_blank"
        >
          <q-avatar icon="save_alt" color="primary" text-color="white" />Download Glance
        </a>
      </q-chip>
    </div>
  </div> -->
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
                />Download Glance
              </a>
            </q-chip>
            <div class="text-caption text-white">Version: 2.1.112</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
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
</style>
