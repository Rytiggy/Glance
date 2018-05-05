function mySettings(props) {
  return (
    <Page>
      <TextImageRow
        label="Glance"
        sublabel="https://github.com/Rytiggy/Glance"
        icon="https://image.ibb.co/gbWF2H/twerp_bowtie_64.png"
      />
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
        <Toggle
          label="12hr | 24hr"
          settingsKey="timeFormat"
        />
        <Toggle
          label="Celsius | Fahrenheit"
          settingsKey="tempType"
        />
        <TextInput
        label="Open Weather Map API Key"
        settingsKey="owmAPI"
        />
        <TextInput
        label="City"
        settingsKey="city"
        />
    </Page>
  );
}

registerSettingsPage(mySettings);