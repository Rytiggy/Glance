function settingsComponent(props) {
  return (
    <Page>
      <Section
        title={
          <Text bold align="center">
            App Settings
          </Text>
        }
      />
    </Page>
  );
}

registerSettingsPage(settingsComponent);
