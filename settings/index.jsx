import largeBg from "../resources/display types/largeBg.png";
import smallBg from "../resources/display types/smallBg.png";
import dualBg from "../resources/display types/dualBg.png";
import largeGraph from "../resources/display types/largeGraph.png";
let displayTypes = {
  largeBg,
  smallBg,
  dualBg,
  largeGraph
};
// init settings

let template = "homePage";
let props = null;
renderPage("homePage");

function mySettings(_props) {
  props = _props;
  let pageToDisplay = template;
  return (
    <Page>
      {pageToDisplay == "homePage" ? (
        <Page>
          <Text>
            <TextImageRow
              label="Glance"
              sublabel="https://glancewatchface.com"
              icon="https://i.ibb.co/XzbJbBv/icon.png"
            />
            <Text>&nbsp;{pageToDisplay == "homePage"}</Text>
            <Text>&nbsp;</Text>
            <Text>
              Glance is a solution for use with Fitbit devices to view your
              blood glucose levels along with a variety of other health stats on
              the watch face. You can see your stats at a glance!
            </Text>
            <Text>&nbsp;</Text>
            <Text align="center">
              <Link source="https://glancewatchface.com/#setup">
                Click here to learn how to set up Glance!
              </Link>
            </Text>
          </Text>

          <Section
            title={
              <Text bold align="center">
                User Agreement
              </Text>
            }
          >
            <Text>
              Glance must not be used to make medical decisions, by using glance
              you agree to the
              <Link source="https://github.com/Rytiggy/Glance/wiki/User-Agreement">
                {" "}
                user agreement
              </Link>
              .
            </Text>
            <Toggle
              settingsKey="userAgreement"
              label="Agree to user agreement"
            />
          </Section>

          <Button
            list
            label="Data Source Settings"
            onClick={() => renderPage("dataSourcePage")}
          />

          <Button
            list
            label="Glucose Settings"
            onClick={() => renderPage("glucoseSettings")}
          />

          <Button
            list
            label="Alert Settings"
            onClick={() => renderPage("alerts")}
          />
          <Button
            list
            label="Treatment Settings"
            onClick={() => renderPage("treatment")}
          />

          <Button
            list
            label="Interface Customization Settings"
            onClick={() => renderPage("interfaceCustomization")}
          />

          <Button
            list
            label="Advanced Settings"
            onClick={() => renderPage("advancedPage")}
          />
        </Page>
      ) : null}

      {pageToDisplay == "account" ? (
        <Page>
          <Button list label="< Back" onClick={() => renderPage("treatment")} />

          <Section
            title={
              <Text bold align="center">
                Glance Account
              </Text>
            }
          >
            <Text>
              Login to your Glance account to save your treatments to the cloud.
              This allows you to share your treatments with followers using the
              same account.
            </Text>
            <Text bold align="center">
              Login
            </Text>
            <TextInput label="Email" settingsKey="email" />
            <TextInput label="Password" settingsKey="password" />
            <TextInput label="Status" settingsKey="status" />
            <Text bold align="center">
              Register
            </Text>
            <Text>
              Create a Glance account to log your treatments to the cloud.
            </Text>
            <Button
              list
              label="Create Account"
              onClick={() => renderPage("register")}
            />
          </Section>
        </Page>
      ) : null}

      {pageToDisplay == "register" ? (
        <Page>
          <Button list label="< Back" onClick={() => renderPage("account")} />

          <Section
            title={
              <Text bold align="center">
                Register
              </Text>
            }
          >
            <Text>
              Create a Glance account to log your treatments to the cloud.
            </Text>
            <TextInput label="Email" settingsKey="email" />
            <TextInput label="Password" settingsKey="password" />
            <TextInput label="Verify password" settingsKey="passwordTwo" />
            <Button
              list
              label="Register"
              onClick={() =>
                props.settingsStorage.setItem(
                  "registerStatus",
                  JSON.stringify({
                    name: "Creating Account"
                  })
                )
              }
            />
            <TextInput label="Status" settingsKey="registerStatus" />
          </Section>
        </Page>
      ) : null}

      {pageToDisplay == "dataSourcePage" ? (
        <Page>
          <Button list label="< Back" onClick={() => renderPage("homePage")} />

          <Section
            title={
              <Text bold align="center">
                Data Source Settings
              </Text>
            }
          >
            <Select
              label={`Blood Sugar Display type`}
              settingsKey="numOfDataSources"
              selectViewTitle="Select a display type"
              options={[
                { img: "smallBg", name: "One Blood Sugar", value: 1 },
                { img: "dualBg", name: "Two Blood Sugars", value: 2 },
                { img: "largeBg", name: "Large Blood Sugar", value: 3 },
                { img: "largeGraph", name: "Large Graph", value: 4 }
              ]}
              renderItem={option => (
                <TextImageRow
                  label={option.name}
                  icon={displayTypes[option.img]}
                />
              )}
            />
            {renderDataSource(props, "dataSource", "Data Source One", {
              customEndpoint: "customEndpoint",
              nightscoutSiteName: "nightscoutSiteName",
              nightscoutSiteHost: "nightscoutSiteHost",
              dexcomUsername: "dexcomUsername",
              dexcomPassword: "dexcomPassword",
              USAVSInternational: "USAVSInternational",
              dataSourceName: "dataSourceName",
              nightscoutAccessToken: "nightscoutAccessToken",
              //FAB
              dropboxToken: "dropboxToken",
              yagiPatientName: "yagiPatientName"
            })}
            {props.settings.numOfDataSources
              ? JSON.parse(props.settings.numOfDataSources).values[0].value == 2
                ? renderDataSource(
                    props,
                    "dataSourceTwo",
                    "Data Source Two",
                    // ["customEndpointTwo", "nightscoutSiteNameTwo","nightscoutSiteHostTwo","dexcomUsernameTwo", "dexcomPasswordTwo","USAVSInternationalTwo", "dataSourceNameTwo", "nightscoutAccessTokenTwo"
                    // //FAB
                    // ,null,"dropboxTokenTwo","yagiPatientNameTwo"
                    // ],
                    {
                      customEndpoint: "customEndpointTwo",
                      nightscoutSiteName: "nightscoutSiteNameTwo",
                      nightscoutSiteHost: "nightscoutSiteHostTwo",
                      dexcomUsername: "dexcomUsernameTwo",
                      dexcomPassword: "dexcomPasswordTwo",
                      USAVSInternational: "USAVSInternationalTwo",
                      dataSourceName: "dataSourceNameTwo",
                      nightscoutSiteToken: "nightscoutSiteTokenTwo",
                      nightscoutAccessToken: "nightscoutAccessTokenTwo",
                      //FAB
                      dropboxToken: "dropboxTokenTwo",
                      yagiPatientName: "yagiPatientNameTwo"
                    }
                  )
                : null
              : null}
          </Section>
        </Page>
      ) : null}

      {pageToDisplay == "glucoseSettings" ? (
        <Page>
          <Button list label="< Back" onClick={() => renderPage("homePage")} />

          <Section
            title={
              <Text bold align="center">
                Glucose Settings
              </Text>
            }
          >
            <Select
              label={`Glucose Units`}
              settingsKey="glucoseUnits"
              options={[
                { name: "mgdl", value: "mgdl" },
                { name: "mmol", value: "mmol" }
              ]}
            />
            <TextInput label="High Threshold" settingsKey="highThreshold" />
            <TextInput label="Low Threshold" settingsKey="lowThreshold" />
          </Section>
        </Page>
      ) : null}

      {pageToDisplay == "alerts" ? (
        <Page>
          <Button list label="< Back" onClick={() => renderPage("homePage")} />

          <Section
            title={
              <Text bold align="center">
                Alerts
              </Text>
            }
          >
            <Toggle settingsKey="disableAlert" label="Disable Alerts" />
            <Toggle settingsKey="highAlerts" label="High Alerts" />
            {/* <TextInput label="Dismiss high alerts for n minutes" settingsKey="dismissHighFor" />  */}
            <Toggle settingsKey="lowAlerts" label="Low Alerts" />
            {/* <TextInput label="Dismiss low alerts for n minutes" settingsKey="dismissLowFor" /> */}
            <Toggle settingsKey="rapidRise" label="Rapid Rise Alerts" />
            <Toggle settingsKey="rapidFall" label="Rapid Fall Alerts" />
            {props.settings.dataSource ? (
              JSON.parse(props.settings.dataSource).values[0].value ==
              "nightscout" ? (
                <Toggle settingsKey="loopstatus" label="Loop Status Alerts" />
              ) : null
            ) : null}
            <Toggle settingsKey="staleData" label="Stale Data Alerts" />
            <TextInput
              label="Stale data alerts after n minutes"
              settingsKey="staleDataAlertAfter"
            />
            <Toggle
              settingsKey="resetAlertDismissal"
              label="Reset alert timer when back in range"
            />
            <Toggle
              settingsKey="disableAlertsWhenNotOnWrist"
              label="Disable Alerts when not wearing watch"
            />
          </Section>
        </Page>
      ) : null}

      {pageToDisplay == "treatment" ? (
        <Page>
          <Button list label="< Back" onClick={() => renderPage("homePage")} />

          <Section
            title={
              <Text bold align="center">
                Treatments
              </Text>
            }
          >
            <Text>
              Treatments are saved on the phone and not published anywhere
              unless you login/create to a Glance account.
            </Text>
            <Toggle settingsKey="localTreatments" label="Glance treatments" />
            {props.settings.localTreatments &&
            JSON.parse(props.settings.localTreatments) == true ? (
              <Section>
                <Text bold align="center">
                  Glance Account
                </Text>
                <Text>
                  Creating a Glance account will save your IOB and COB
                  treatments to the cloud and allow you to share them with
                  followers.
                </Text>
                <Button
                  list
                  label="Login/Register"
                  onClick={() => renderPage("account")}
                />

                <Text bold align="center">
                  Profile
                </Text>
                <TextInput
                  label="Duration of Insulin Activity (DIA) [hours]"
                  settingsKey="dia"
                />
                <TextInput
                  label="Insulin to carb ratio (I:C) [g]"
                  settingsKey="insulinToCarb"
                />
                <TextInput
                  label="Insulin Sensitivity Factor (ISF) [mg/dL/U,mmol/L/U]"
                  settingsKey="isf"
                />
                <TextInput
                  label="Carbs activity / absorption rate: [g/hour]"
                  settingsKey="carbsPerHour"
                />
                <TextInput
                  label="Basal rates [unit/hour]"
                  settingsKey="basal"
                />
              </Section>
            ) : null}
            {props.settings.dataSource ? (
              JSON.parse(props.settings.dataSource).values[0].value ==
                "nightscout" ||
              (props.settings.dataSourceTwo &&
                JSON.parse(props.settings.dataSourceTwo).values[0].value ==
                  "nightscout") ||
              (props.settings.localTreatments &&
                JSON.parse(props.settings.localTreatments) == true) ? (
                <Section>
                  <Text bold align="center">
                    Graph
                  </Text>
                  <Toggle
                    settingsKey="enableSmallGraphPrediction"
                    label="Graph Predictions"
                  />
                </Section>
              ) : null
            ) : null}
          </Section>
        </Page>
      ) : null}

      {pageToDisplay == "interfaceCustomization" ? (
        <Page>
          <Button list label="< Back" onClick={() => renderPage("homePage")} />
          <Section
            title={
              <Text bold align="center">
                Interface Customization
              </Text>
            }
          >
            {/* <Text align="center" bold>
          Weather
        </Text>
        <Select label={`Temperature units`} settingsKey="tempType" options={[ {name:"Fahrenheit", value:"f"}, {name:"Celsius", value:"c"} ]} />
        */}

            {/* <Toggle settingsKey="largeGraph" label="Large graph popup screen" /> */}
            {/* <Text>
          Tap the lower right hand side of the watch faces screen to view the
          larger graph popup screen.
        </Text> */}

            <Text bold align="center">
              Background Color
            </Text>
            <ColorSelect
              centered={true}
              settingsKey="bgColor"
              colors={[
                { color: "#390263" },
                { color: "#1F618D" },
                { color: "#aa2c73" },
                { color: "#025C63" },
                { color: "#000000" },
                { color: "#FFFFFF" }
              ]}
            />

            {props.settings.bgColor ? (
              JSON.parse(props.settings.bgColor) == "#FFFFFF" ? (
                <Section title={}>
                  <Text bold align="center">
                    Random Color Generator
                  </Text>
                  <Text>
                    The white color circle will generate a random color for you,
                    if you find a color that youbold like turn on save color to
                    save it! Need help finding a hex color code?{" "}
                    <Link source="https://www.color-hex.com/">
                      check out this site.
                    </Link>
                  </Text>
                  <Toggle settingsKey="saveColor" label="Save Color" />
                  <TextInput
                    label="Hex Color One"
                    settingsKey="hexColor"
                  />{" "}
                  <TextInput label="Hex Color Two" settingsKey="hexColorTwo" />{" "}
                  <TextInput label="Text Color" settingsKey="textColor" />
                </Section>
              ) : null
            ) : null}

            {props.settings.dataSource ? (
              JSON.parse(props.settings.dataSource).values[0].value ==
                "nightscout" ||
              JSON.parse(props.settings.dataSource).values[0].value ==
                "spike" ||
              (props.settings.dataSourceTwo &&
                (JSON.parse(props.settings.dataSourceTwo).values[0].value ==
                  "nightscout" ||
                  JSON.parse(props.settings.dataSourceTwo).values[0].value ==
                    "spike")) ? (
                <Section>
                  <Text bold align="center">
                    Stat Layout Settings
                  </Text>
                  <Text>
                    The customize section is used for customizing the user
                    interface of Glance, you can replace the default values of
                    Glance with other values present.
                  </Text>
                  <Text>
                    Note: If the value selected is not present on your data
                    source it will show the default option.
                  </Text>
                  <Select
                    label={`Layout One`}
                    settingsKey="layoutOne"
                    options={[
                      { name: "Insulin on board (default)", value: "iob" },
                      { name: "predicted bg", value: "predictedbg" },
                      { name: "current bg", value: "currentbg" },
                      { name: "temp basal", value: "tempbasal" },
                      { name: "raw bg", value: "rawbg" },
                      { name: "loop status", value: "loopstatus" },
                      { name: "uploader battery", value: "upbat" },
                      { name: "Sensor age", value: "sage" }
                    ]}
                  />
                  <Select
                    label={`Layout Two`}
                    settingsKey="layoutTwo"
                    options={[
                      { name: "Carbs on board (default)", value: "cob" },
                      { name: "predicted bg", value: "predictedbg" },
                      { name: "current bg", value: "currentbg" },
                      { name: "temp basal", value: "tempbasal" },
                      { name: "raw bg", value: "rawbg" },
                      { name: "loop status", value: "loopstatus" },
                      { name: "uploader battery", value: "upbat" },
                      { name: "Sensor age", value: "sage" }
                    ]}
                  />
                  <Select
                    label={`Layout Three`}
                    settingsKey="layoutThree"
                    options={[
                      { name: "steps (default)", value: "steps" },
                      { name: "predicted bg", value: "predictedbg" },
                      { name: "current bg", value: "currentbg" },
                      { name: "temp basal", value: "tempbasal" },
                      { name: "raw bg", value: "rawbg" },
                      { name: "loop status", value: "loopstatus" },
                      { name: "uploader battery", value: "upbat" },
                      { name: "Sensor age", value: "sage" }
                    ]}
                  />
                  <Select
                    label={`Layout Four`}
                    settingsKey="layoutFour"
                    options={[
                      { name: "heart (default)", value: "heart" },
                      { name: "predicted bg", value: "predictedbg" },
                      { name: "current bg", value: "currentbg" },
                      { name: "temp basal", value: "tempbasal" },
                      { name: "raw bg", value: "rawbg" },
                      { name: "loop status", value: "loopstatus" },
                      { name: "uploader battery", value: "upbat" },
                      { name: "Sensor age", value: "sage" }
                    ]}
                  />
                </Section>
              ) : null
            ) : null}
          </Section>
          <Section>
            <Text bold align="center">
              Date Time Settings
            </Text>
            <Select
              label={`Date Format`}
              settingsKey="dateFormat"
              options={[
                { name: "MM/DD/YYYY", value: "MM/DD/YYYY" },
                { name: "DD/MM/YYYY", value: "DD/MM/YYYY" },
                { name: "YYYY/MM/DD", value: "YYYY/MM/DD" },
                { name: "DD.MM.YYYY", value: "DD.MM.YYYY" }
              ]}
            />
            <Toggle
              settingsKey="enableDOW"
              label="Day of week at end of date"
            />
          </Section>
        </Page>
      ) : null}

      {pageToDisplay == "advancedPage" ? (
        <Page>
          <Button list label="Back" onClick={() => renderPage("homePage")} />
          <Section
            title={
              <Text bold align="center">
                Advanced
              </Text>
            }
          >
            <TextInput label="logs" settingsKey="logs" />
            <TextInput disabled label="Unique Identifier" settingsKey="uuid" />
            <Button
              list
              label="Sync"
              onClick={() =>
                props.settingsStorage.setItem(
                  "logs",
                  JSON.stringify({ name: `["${Date.now()} : Syncing"]` })
                )
              }
            />
            <Button
              list
              label="Reset settings to defaults"
              onClick={() => clearSettings(props)}
            />
          </Section>
        </Page>
      ) : null}
    </Page>
  );
}

function renderDataSource(props, id, title, keys) {
  // keys: Object of Element Ids (used for targeting the value)
  return (
    <Section>
      <TextImageRow
        label={<Text bold>{title}</Text>}
        sublabel=""
        icon="https://i.ibb.co/R42vWmg/Blood-drop-plain-svg.png"
      />
      <TextInput label="Data Source Name" settingsKey={keys.dataSourceName} />
      <Select
        label={`Data Source`}
        settingsKey={id}
        options={[
          { name: "Dexcom", value: "dexcom" },
          { name: "Nightscout", value: "nightscout" },
          { name: "xDrip+", value: "xdrip" },
          { name: "Spike", value: "spike" },
          { name: "Tomato", value: "tomato" },
          { name: "DeeBee.it Yagi", value: "yagi" },
          { name: "custom", value: "custom" }
        ]}
      />
      {props.settings[id] ? (
        JSON.parse(props.settings[id]).values[0].value == "custom" ? (
          <TextInput label="Api endpoint" settingsKey={keys.customEndpoint} />
        ) : null
      ) : null}

      {/* FAB */}
      {props.settings[id] ? (
        JSON.parse(props.settings[id]).values[0].value == "yagi" ? (
          <Section>
            <TextInput
              title="YagiCode"
              label="Yagi Code"
              settingsKey={keys.dropboxToken}
            />
            <TextInput
              title="YagiPatientName"
              label="Patient Name (only for multiple users - optional)"
              settingsKey={keys.yagiPatientName}
            />
            <Text>
              Tip: get your Yagi Code by accessing{" "}
              <Link source="https://www.deebee.it/yagi">
                https://www.deebee.it/yagi
              </Link>
            </Text>
          </Section>
        ) : null
      ) : null}

      {props.settings[id] ? (
        JSON.parse(props.settings[id]).values[0].value == "nightscout" ? (
          <Section>
            <Text text="center">
              https://<Text bold>SiteName</Text>.NightscoutHostSite.com
            </Text>
            <TextInput
              title="Nightscout"
              label="Site Name"
              settingsKey={keys.nightscoutSiteName}
            />
            <Text text="center">
              https://SiteName.<Text bold>NightscoutHostSite</Text>.com
            </Text>
            <Select
              label="Nightscout Host Site"
              settingsKey={keys.nightscoutSiteHost}
              options={[
                {
                  name: "Heroku",
                  value: "herokuapp.com"
                },
                {
                  name: "Azure",
                  value: "azurewebsites.net"
                }
              ]}
            />
            <TextInput
              title="Nightscout Access Token"
              label="Access Token (optional)"
              settingsKey={keys.nightscoutAccessToken}
            />
          </Section>
        ) : null
      ) : null}
      {props.settings[id] ? (
        JSON.parse(props.settings[id]).values[0].value == "dexcom" ? (
          <Section
            title={
              <Text bold align="center">
                Dexcom
              </Text>
            }
          >
            <TextInput
              title="Username"
              label="Dexcom Username"
              settingsKey={keys.dexcomUsername}
            />
            <TextInput
              title="Password"
              label="Dexcom Password"
              settingsKey={keys.dexcomPassword}
            />
            <Toggle
              settingsKey={keys.USAVSInternational}
              label="International (Not in USA)"
            />
          </Section>
        ) : null
      ) : null}
    </Section>
  );
}

function clearSettings(props) {
  let uuid = props.settings.uuid;
  props.settingsStorage.clear();
  props.settingsStorage.setItem("uuid", uuid);
  renderPage("homePage");
}

function renderPage(temp) {
  template = temp;
  mySettings(props);
  if (props) {
    props.settingsStorage.setItem(
      "logs",
      props.settingsStorage.getItem("logs")
    );
  }
}

registerSettingsPage(mySettings);
