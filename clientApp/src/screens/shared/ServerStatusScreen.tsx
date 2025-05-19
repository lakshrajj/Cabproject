import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import { checkServerStatus, checkMultipleServers } from '../../utils/serverCheck';
import apiConfig from '../../config/apiConfig';
import { COLORS } from '../../utils/theme';

const ServerStatusScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState({
    isConnected: false,
    serverReachable: false,
    message: 'Checking server status...'
  });
  const [multiServerStatus, setMultiServerStatus] = useState<Record<string, boolean>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const status = await checkServerStatus();
      setServerStatus(status);
      
      // If basic check fails, automatically run the advanced check
      if (!status.serverReachable) {
        const multiStatus = await checkMultipleServers();
        setMultiServerStatus(multiStatus);
        setShowAdvanced(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check server status');
    } finally {
      setLoading(false);
    }
  };

  const runAdvancedCheck = async () => {
    setLoading(true);
    try {
      const multiStatus = await checkMultipleServers();
      setMultiServerStatus(multiStatus);
      setShowAdvanced(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to run advanced check');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Server Connection Status" />
        <Card.Content>
          <Text style={styles.configText}>
            Current server: {apiConfig.baseUrl}
          </Text>
          <Text style={styles.configText}>
            Timeout: {apiConfig.timeout}ms
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text>Checking server status...</Text>
            </View>
          ) : (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                Internet Connection: {' '}
                <Text style={serverStatus.isConnected ? styles.success : styles.error}>
                  {serverStatus.isConnected ? 'Connected' : 'Not Connected'}
                </Text>
              </Text>
              
              <Text style={styles.statusText}>
                Server Reachable: {' '}
                <Text style={serverStatus.serverReachable ? styles.success : styles.error}>
                  {serverStatus.serverReachable ? 'Yes' : 'No'}
                </Text>
              </Text>
              
              <Text style={styles.messageText}>{serverStatus.message}</Text>
            </View>
          )}
          
          <Button 
            mode="contained" 
            onPress={checkStatus} 
            style={styles.button}
            disabled={loading}
          >
            Refresh Status
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={runAdvancedCheck} 
            style={styles.button}
            disabled={loading}
          >
            {showAdvanced ? 'Run Again' : 'Advanced Diagnostics'}
          </Button>
        </Card.Content>
      </Card>
      
      {showAdvanced && (
        <Card style={styles.card}>
          <Card.Title title="Advanced Server Checks" />
          <Card.Content>
            <Text style={styles.subtitle}>Testing Multiple Server URLs:</Text>
            {Object.entries(multiServerStatus).map(([url, reachable]) => (
              <Text key={url} style={styles.serverStatus}>
                {url}: <Text style={reachable ? styles.success : styles.error}>
                  {reachable ? 'Reachable' : 'Not Reachable'}
                </Text>
              </Text>
            ))}
            
            <Text style={styles.helpText}>
              If one of these servers is reachable but your app cannot connect,
              update the server URL in src/config/apiConfig.ts
            </Text>
          </Card.Content>
        </Card>
      )}
      
      <Card style={styles.card}>
        <Card.Title title="Troubleshooting Tips" />
        <Card.Content>
          <Text style={styles.tipTitle}>If you're using an emulator:</Text>
          <Text style={styles.tipText}>• Android emulator should use 10.0.2.2 instead of localhost</Text>
          <Text style={styles.tipText}>• iOS simulator can use localhost directly</Text>
          
          <Text style={styles.tipTitle}>If you're using a physical device:</Text>
          <Text style={styles.tipText}>• Make sure the server and device are on the same network</Text>
          <Text style={styles.tipText}>• Use the server's local IP address (like 192.168.1.x)</Text>
          <Text style={styles.tipText}>• Check that your server allows external connections</Text>
          
          <Text style={styles.tipTitle}>General tips:</Text>
          <Text style={styles.tipText}>• Verify the server is running</Text>
          <Text style={styles.tipText}>• Check firewall settings</Text>
          <Text style={styles.tipText}>• Try restarting the server</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusContainer: {
    marginVertical: 10,
  },
  configText: {
    marginBottom: 5,
    fontSize: 14,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 15,
    fontStyle: 'italic',
    marginTop: 5,
    color: COLORS.text,
  },
  success: {
    color: 'green',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  serverStatus: {
    fontSize: 14,
    marginBottom: 5,
  },
  helpText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 10,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    marginBottom: 3,
  },
});

export default ServerStatusScreen;