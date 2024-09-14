import neo4j from 'neo4j-driver';

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '12345678'));

export const getAllStation = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (s:station) return s.nodeId');
    const stationNames = result.records.map(record => record.get(0));
    res.send(stationNames);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching stations');
  } finally {
    await session.close();
  }
}

export const getPolyonOfStation = async (req, res) => {
  const { station, polygon } = req.params;
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (s:station {nodeId: $station})-[:haveIso]->(p:staion_isochrone {nodeId: $polygon})
      RETURN p.location as location
    `, { station, polygon });
    const location = result.records.map(record => record.get(0));
    res.send(location);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching locations');
  } finally {
    await session.close();
  }
}

export const getBlockInPolygon = async (req, res) => {
  const { station, polygon } = req.params;
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (s:station {nodeId: $station})-[:haveIso]->(p:staion_isochrone {nodeId: $polygon})-[:includeBlock]->(b:block)
      RETURN b.nodeId as blockName
    `, { station, polygon });
    const blockNames = result.records.map(record => record.get('blockName'));
    res.send(blockNames);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching blocks');
  } finally {
    await session.close();
  }
};

export const getPropertyOfAllBlockInPolygon = async (req, res) => {
  const { station, polygon, property } = req.params;
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (s:station {nodeId: $station})-[:haveIso]->(p:staion_isochrone {nodeId: $polygon})-[:includeBlock]->(b:block)
      RETURN b[$property] as propertyValue
    `, { station, polygon, property });
    const propertyValues = result.records.map(record => record.get('propertyValue'));
    res.send(propertyValues);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching property');
  } finally {
    await session.close();
  }
}

export const getPropertyOfBlockInPolygon = async (req, res) => {
  const { station, polygon, block, property } = req.params;
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (s:station {nodeId: $station})-[:haveIso]->(p:staion_isochrone {nodeId: $polygon})-[:includeBlock]->(b:block {nodeId: $block})
      RETURN b[$property] as propertyValue
    `, { station, polygon, block, property });
    const propertyValue = result.records.map(record => record.get('propertyValue'));
    res.send(propertyValue);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching property');
  } finally {
    await session.close();
  }
}

export const getEntranceLocations = async (req, res) => {
  const { station } = req.params;
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (s:station {nodeId: $station})
      RETURN s.entrance_locations as entranceLocations
    `, { station });
    const entranceLocations = result.records.map(record => record.get('entranceLocations'));
    res.send(entranceLocations);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching entrance locations');
  } finally {
    await session.close();
  }
}
