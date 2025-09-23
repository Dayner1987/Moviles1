import { API } from '@/app/ip/IpDirection';
import { Picker } from '@react-native-picker/picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type EarningsResponse = {
  total: number;
  daily: Record<string, number>;
};

export default function Earnings() {
  const [totalGanancias, setTotalGanancias] = useState<number>(0);
  const [gananciasDiarias, setGananciasDiarias] = useState<Record<string, number>>({});
  const [filtro, setFiltro] = useState<string>('hoy');
  const [loading, setLoading] = useState<boolean>(false);

  const calcularGanancias = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/orders/earnings?filter=${filtro}`);
      if (!res.ok) throw new Error(`Error en la API: ${res.status}`);

      const data: EarningsResponse = await res.json();
      setTotalGanancias(data.total || 0);
      setGananciasDiarias(data.daily || {});
    } catch (err) {
      console.error('Error cargando ganancias:', err);
      setTotalGanancias(0);
      setGananciasDiarias({});
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  // Generar PDF y abrirlo directamente
  const generarPDF = async () => {
    if (Object.keys(gananciasDiarias).length === 0) return;

    let html = `<h1>Informe de Ganancias</h1>`;
    html += `<h2>Total: ${totalGanancias.toFixed(2)} Bs</h2>`;
    html += `<table border="1" style="width:100%; border-collapse: collapse;">
              <tr><th>Fecha</th><th>Total (Bs)</th></tr>`;
    Object.entries(gananciasDiarias)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .forEach(([fecha, total]) => {
        html += `<tr><td>${fecha}</td><td>${total.toFixed(2)}</td></tr>`;
      });
    html += `</table>`;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri); // abrir directamente el PDF
    } catch (error) {
      console.error('Error generando PDF:', error);
    }
  };

  useEffect(() => {
    calcularGanancias();
  }, [calcularGanancias]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ganancias</Text>

      <Text style={styles.label}>Filtrar por:</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={filtro} onValueChange={setFiltro} style={styles.picker}>
          <Picker.Item label="Hoy" value="hoy" />
          <Picker.Item label="Ayer" value="ayer" />
          <Picker.Item label="Semana pasada" value="semana" />
          <Picker.Item label="Mes pasado" value="mes" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={calcularGanancias} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Cargando...' : 'Calcular Ganancias'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#ffffffff' }]} onPress={generarPDF}>
        <Text style={styles.buttonText}>PDF(PDF)</Text>
        <Image
              source={require('../../../assets/images/pdf.png')}
              resizeMode="contain"
          />
      </TouchableOpacity>

      <Text style={styles.result}>Total: {totalGanancias.toFixed(2)} Bs</Text>

      <Text style={[styles.title, { marginTop: 20 }]}>Detalle diario</Text>
      {Object.keys(gananciasDiarias).length === 0 ? (
        <Text style={{ fontStyle: 'italic', marginTop: 5 }}>No hay ganancias en este período.</Text>
      ) : (
        Object.entries(gananciasDiarias)
          .sort(([fechaA], [fechaB]) => (fechaA > fechaB ? 1 : -1))
          .map(([fecha, total]) => (
            <View key={fecha} style={styles.dailyRow}>
              <Text>{fecha}</Text>
              <Text>{total.toFixed(2)} Bs</Text>
            </View>
          ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 10 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: { height: 50 },
  button: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, marginBottom: 20 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  result: { fontSize: 20, fontWeight: 'bold' },
  dailyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
});
