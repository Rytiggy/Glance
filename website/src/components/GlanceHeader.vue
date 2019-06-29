<template>
  <div class="relative-position glance-header">
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
  </div>
</template>

<script>
export default {};
</script>

<style>
.glance-header {
  height: calc(100vh - 150px);
}
</style>
