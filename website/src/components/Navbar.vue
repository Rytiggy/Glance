<template>
    <q-toolbar class="text-grey-9">
    <q-toolbar-title>
      <q-btn stretch to="/" flat fit>
        <q-avatar>
          <img src="../statics/favicon.png">
        </q-avatar>
        <span class="gt-xs text-h5 glance-logo">Glance</span>
      </q-btn>
      <q-separator vertical />
    </q-toolbar-title>
    <q-separator vertical />
      <q-btn
        stretch
        flat
        fit 
        type="a"
        class="no-underline text-h6 q-px-sm text-grey-7 q-px-md"
        target="_blank"
        href="https://github.com/Rytiggy/Glance"
      >
        <i class="fab fa-github"></i>
      </q-btn>
      <q-separator vertical />
      <q-btn
        stretch
        flat
        fit 
        type="a"
        class="no-underline text-h6 q-px-sm text-grey-7 q-px-md"
        target="_blank"
        href="https://www.facebook.com/groups/Glance/"
      >
        <i class="fab fa-facebook"></i>
      </q-btn>
      <q-separator vertical />
      <q-btn
        stretch
        flat
        fit 
        type="a"
        class="no-underline text-h6 q-px-sm text-grey-7 q-px-md"
        target="_blank"
        href="https://discord.gg/RUa7U6F/"
      >
        <i class="fab fa-discord"></i>
    </q-btn>
    <q-separator vertical />
    <q-btn
      class="text-grey-7"
      icon="help"
      no-caps
      stretch
      to="/troubleshooting"
      flat
      fit
    />
  </q-toolbar>
</template>

<script>
export default {

}
</script>

<style>

</style>
