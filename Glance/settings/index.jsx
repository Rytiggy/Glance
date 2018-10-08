function mySettings(props) {
  return (
    <Page>
      <TextImageRow
        label="Glance"
        sublabel="https://github.com/Rytiggy/Glance"
        icon="https://image.ibb.co/gbWF2H/twerp_bowtie_64.png"
      />
        <Text align="center" bold>
         BG Setting
        </Text>
        <TextInput
          label="Api endpoint"
          settingsKey="endpoint"
        />
        <TextInput
          label="High threshold"
          settingsKey="highThreshold"
        />
        <TextInput
        label="Low threshold"
        settingsKey="lowThreshold"
        />
        <Select
          label={`Glucose Units`}
          settingsKey="units"
          options={[
            {name:"mgdl"},
            {name:"mmol"}
          ]}
        />
        <Toggle
            settingsKey="disableAlert"
            label="Disable Alerts"
          />
        <Text align="center" bold>
         📅Date/Time
        </Text>
        <Toggle
          label="12hr | 24hr"
          settingsKey="timeFormat"
        />
        <Select
          label={`Date Format`}
          settingsKey="dateFormat"
          options={[
            {name:"MM/DD/YYYY"},
            {name:"DD/MM/YYYY"},
            {name:"YYYY-MM-DD"}
          ]}
        />
        <Text align="center" bold>
         🌤️Weather
        </Text>
        <Toggle
          label="Celsius | Fahrenheit"
          settingsKey="tempType"
        />
        <TextInput
        label="City"
        settingsKey="city"
        />
        <Text align="center" bold>
        Background Color
        </Text>
        <ColorSelect
          settingsKey="bgColor"
          colors={[
            {color: "#390263"},
            {color: "#1F618D"},
            {color: "#aa2c73"},
            {color: "#117A65"}
          ]}
        />
    </Page>
  );
}

registerSettingsPage(mySettings);
