<template>
  <div class="donations q-py-xl">
    <div class="q-pa-xl">
      <div class="text-white text-h3 text-center">Donations</div>
      <div class="q-pb-md text-white text-center full-width">
        <div class="description-lead text-body1">
          I developed Glance to help people with diabetes! 50% of all donations will go directly to the
          <a
            class="text-primary"
            target="_blank"
            href="https://www.faustmanlab.org/"
          >Faustman lab</a>.
          The remaining 50% will be dedicated to future research and development of Glance.
        </div>
        <div class="q-pt-md">
          <q-card flat bordered class="donation-card text-grey-10">
            <q-card-section>
              <img src="../statics/paypal-logo.png">
            </q-card-section>

            <q-card-section>Donations can be made through paypal</q-card-section>
            <q-card-section>
              <q-btn-group push>
                <q-btn
                  type="a"
                  target="_blank"
                  href="https://paypal.me/ryanmasonjar/1"
                  no-caps
                  color="primary"
                >
                  $1
                </q-btn>
                  <q-btn
                  type="a"
                  target="_blank"
                  href="https://paypal.me/ryanmasonjar/5"
                  no-caps
                  color="primary"
                >
                  $5
                </q-btn>
                <q-btn
                  type="a"
                  target="_blank"
                  href="https://paypal.me/ryanmasonjar/10"
                  no-caps
                  color="primary"
                >
                  $10
                </q-btn>
                <q-btn
                  type="a"
                  target="_blank"
                  href="https://paypal.me/ryanmasonjar"
                  no-caps
                  color="primary"
                >
                  Other
                </q-btn>
              </q-btn-group>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Donations",
  data() {
    return {};
  }
};
</script>

<style>
.donations {
  background: linear-gradient(
      rgba(34, 34, 34, 0.9) 100%,
      rgba(34, 34, 34, 0.9) 100%
    ),
    url("../statics/bg3.jpg");
  background-position: bottom;
}
.donation-card {
  margin: auto;
  max-width: 350px;
}
</style>
