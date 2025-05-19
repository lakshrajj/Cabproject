import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Text, Card, List, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLORS } from '../../utils/theme';

const SupportScreen = () => {
  const openEmail = () => {
    Linking.openURL('mailto:support@rideshare.com');
  };

  const openPhone = () => {
    Linking.openURL('tel:+1234567890');
  };

  const openWebsite = () => {
    Linking.openURL('https://rideshare.com/support');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="headphones" size={60} color={COLORS.primary} />
        <Text style={styles.headerTitle}>How can we help you?</Text>
        <Text style={styles.headerSubtitle}>
          Our support team is here to assist you with any questions or issues
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          
          <TouchableOpacity onPress={openEmail}>
            <List.Item
              title="Email Support"
              description="support@rideshare.com"
              left={(props) => <List.Icon {...props} icon="email" color={COLORS.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
          </TouchableOpacity>
          
          <Divider />
          
          <TouchableOpacity onPress={openPhone}>
            <List.Item
              title="Phone Support"
              description="+1 (234) 567-890"
              left={(props) => <List.Icon {...props} icon="phone" color={COLORS.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
          </TouchableOpacity>
          
          <Divider />
          
          <TouchableOpacity onPress={openWebsite}>
            <List.Item
              title="Help Center"
              description="Visit our online help center"
              left={(props) => <List.Icon {...props} icon="web" color={COLORS.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>FAQs</Text>
          
          <List.Accordion
            title="How do I book a ride?"
            left={(props) => <List.Icon {...props} icon="car" />}
          >
            <List.Item
              description="To book a ride, go to the Home screen, enter your pickup and drop-off locations, select a ride from the available options, and confirm your booking. You'll receive a confirmation once the driver accepts."
              descriptionNumberOfLines={5}
            />
          </List.Accordion>
          
          <Divider />
          
          <List.Accordion
            title="How do I cancel a booking?"
            left={(props) => <List.Icon {...props} icon="close-circle" />}
          >
            <List.Item
              description="To cancel a booking, go to My Bookings, select the booking you want to cancel, and tap the Cancel button. Please note that cancellations made close to the pickup time may incur a cancellation fee."
              descriptionNumberOfLines={5}
            />
          </List.Accordion>
          
          <Divider />
          
          <List.Accordion
            title="How do I become a driver?"
            left={(props) => <List.Icon {...props} icon="account-arrow-right" />}
          >
            <List.Item
              description="To become a driver, register a new account and select the Driver option. You'll need to provide your vehicle details and driver's license information. Once verified, you can start offering rides."
              descriptionNumberOfLines={5}
            />
          </List.Accordion>
          
          <Divider />
          
          <List.Accordion
            title="How do payments work?"
            left={(props) => <List.Icon {...props} icon="cash" />}
          >
            <List.Item
              description="Currently, all payments are handled in cash directly between riders and drivers. The app shows the fare upfront so both parties know the cost before the ride begins."
              descriptionNumberOfLines={5}
            />
          </List.Accordion>
          
          <Divider />
          
          <List.Accordion
            title="What if I left something in the car?"
            left={(props) => <List.Icon {...props} icon="bag-personal" />}
          >
            <List.Item
              description="If you left something in the car, you can contact your driver through the app by viewing your past ride details. Alternatively, contact our support team and we'll help you get in touch with the driver."
              descriptionNumberOfLines={5}
            />
          </List.Accordion>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <List.Item
            title="App Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" color={COLORS.text} />}
          />
          
          <Divider />
          
          <TouchableOpacity>
            <List.Item
              title="Terms of Service"
              left={(props) => <List.Icon {...props} icon="file-document" color={COLORS.text} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
          </TouchableOpacity>
          
          <Divider />
          
          <TouchableOpacity>
            <List.Item
              title="Privacy Policy"
              left={(props) => <List.Icon {...props} icon="shield-account" color={COLORS.text} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.placeholder,
    marginTop: 10,
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});

export default SupportScreen;