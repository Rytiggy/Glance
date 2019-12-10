<template>
  <q-page padding>
    <div class="description-lead q-py-xl">
      <div class="text-h3 text-center q-pb-md">Troubleshooting</div>
      <div class="text-h6 text-grey-10">Sync Issue/Not connecting:</div>
      <q-carousel
        v-model="troubleshootingSlide"
        :fullscreen.sync="troubleshootingFullscreen"
        infinite
        class="bg-white"
      >
        <q-carousel-slide
          class="troubleshootSlide troubleshooting-decision-tree"
          :name="1"
          img-src="../statics/decisionTree.png"
        />

        <template v-slot:control>
          <q-carousel-control position="bottom-right" :offset="[18, 18]">
            <q-btn
              push
              round
              dense
              color="white"
              text-color="primary"
              :icon="
                troubleshootingFullscreen ? 'fullscreen_exit' : 'fullscreen'
              "
              @click="troubleshootingFullscreen = !troubleshootingFullscreen"
            />
          </q-carousel-control>
        </template>
      </q-carousel>
      <div class="text-h6 text-grey-10">Common Error Codes:</div>
      <div class="bullet">
        DSE: Data Source error - generic error with
        <a
          class="text-primary"
          target="_blank"
          href="https://github.com/Rytiggy/Glance/wiki/How-to-configuring-Glance's-settings#datasource"
          >your data source
        </a>
        try opening Glance's settings
      </div>
      <div class="bullet">
        E500: A very general HTTP status code that means something has gone
        wrong on your site's server but the server could not be more specific on
        what the exact problem is.
      </div>
      <div class="bullet">
        E503: A HTTP status code that means the server is simply not available
        right now. Or you haven't configured your data source right.
      </div>
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
    </div>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      troubleshootingFullscreen: false,
      troubleshootingSlide: 1
    };
  }
};
</script>

<style>
.troubleshooting-decision-tree {
  background-size: contain !important;
  background-repeat: no-repeat;
}
</style>
