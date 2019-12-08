<template>
  <q-toolbar class="text-grey-9">
    <q-btn stretch to="/" flat fit>
      <q-avatar>
        <img src="../statics/favicon.png" />
      </q-avatar>
      <span class="gt-xs text-h5 glance-logo">Glance</span>
    </q-btn>
    <q-separator vertical />
    <q-btn
      stretch
      flat
      fit
      type="a"
      class="no-underline text-h6 q-px-sm text-grey-7 q-px-md gt-xs"
      target="_blank"
      href="https://github.com/Rytiggy/Glance"
    >
      <i class="fab fa-github"></i>
    </q-btn>
    <q-separator vertical class="gt-xs" />
    <q-btn
      stretch
      flat
      fit
      type="a"
      class="no-underline text-h6 q-px-sm text-grey-7 q-px-md gt-xs"
      target="_blank"
      href="https://www.facebook.com/groups/Glance/"
    >
      <i class="fab fa-facebook"></i>
    </q-btn>
    <q-separator vertical class="gt-xs" />
    <q-btn
      stretch
      flat
      fit
      type="a"
      class="no-underline text-h6 q-px-sm text-grey-7 q-px-md gt-xs"
      target="_blank"
      href="https://discord.gg/RUa7U6F/"
    >
      <i class="fab fa-discord"></i>
    </q-btn>
    <q-separator class="gt-xs" vertical />

    <q-space />

    <q-separator class="lt-sm" vertical />
    <q-btn-dropdown
      icon="more_vert"
      no-caps
      stretch
      flat
      fit
      class="text-grey-7 lt-sm"
    >
      <q-list>
        <q-item clickable v-close-popup>
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
        </q-item>
        <q-item clickable v-close-popup>
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
        </q-item>
        <q-item clickable v-close-popup>
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
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <q-separator vertical />
    <q-btn
      class="text-grey-7"
      icon="palette"
      no-caps
      stretch
      to="/customize"
      flat
      fit
    />
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
export default {};
</script>

<style></style>
