import { ConsumptionData } from '../../types/consumption';

const STORAGE_KEY = 'enedis_consumption_data';

export async function saveConsumptionData(data: ConsumptionData[]): Promise<ConsumptionData[]> {
  try {
    console.log(`Sauvegarde de ${data.length} jours de données de consommation`);
    const existingData = getStoredData();
    const mergedData = mergeConsumptionData(existingData, data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData));
    return mergedData;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données:', error);
    throw error;
  }
}

export async function getConsumptionData(prm: string, startDate: string, endDate: string): Promise<ConsumptionData[]> {
  try {
    console.log(`Récupération des données pour le PDL ${prm} du ${startDate} au ${endDate}`);
    const data = getStoredData();
    return filterConsumptionData(data, prm, startDate, endDate);
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    throw error;
  }
}

function getStoredData(): ConsumptionData[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    console.log('Aucune donnée stockée dans le localStorage');
    return [];
  }
  
  try {
    const data = JSON.parse(stored);
    console.log(`${data.length} jours de données trouvés dans le localStorage`);
    return data;
  } catch (error) {
    console.error('Erreur lors du parsing des données stockées:', error);
    return [];
  }
}

function mergeConsumptionData(existing: ConsumptionData[], newData: ConsumptionData[]): ConsumptionData[] {
  console.log(`Fusion de ${existing.length} jours existants avec ${newData.length} nouveaux jours`);
  const dataMap = new Map(existing.map(item => [`${item.prm}-${item.date}`, item]));
  
  newData.forEach(item => {
    dataMap.set(`${item.prm}-${item.date}`, item);
  });

  const result = Array.from(dataMap.values());
  console.log(`Résultat de la fusion: ${result.length} jours`);
  return result;
}

function filterConsumptionData(
  data: ConsumptionData[],
  prm: string,
  startDate: string,
  endDate: string
): ConsumptionData[] {
  console.log(`Filtrage des données pour le PDL ${prm} du ${startDate} au ${endDate}`);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const filtered = data.filter(item => {
    const date = new Date(item.date);
    return (
      item.prm === prm &&
      date >= start &&
      date <= end
    );
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  console.log(`${filtered.length} jours après filtrage`);
  return filtered;
}