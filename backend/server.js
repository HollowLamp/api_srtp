
import express from 'express';
import cors from 'cors';
import neo4j from 'neo4j-driver';


const app = express();
const PORT = 3001;
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '12345678'));



app.use(cors());




//返回所有站点名称，城市可以忽略，目前只有南京
const getAllStation = async(req, res) => {
  const session = driver.session();
  try{
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

app.get('/query/:city/station', getAllStation);

//返回指定站点名称的制定等时圈的轮廓属性
const getPolyonOfStation = async(req, res) => {
  const { station, polygon } = req.params;
  const session = driver.session();
  try{
    const result = await session.run(`
      MATCH (s:station {nodeId: $station})-[:containIso]->(p:staion_isochrone {nodeId: $polygon})
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

app.get('/query/:city/:station/:polygon', getPolyonOfStation);

//返回返回指定站点下的指定轮廓下的所有地块的名称
const getBlockInPolygon = async (req, res) => {
  const { station, polygon } = req.params;
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (s:station {nodeId: $station})-[:containIso]->(p:staion_isochrone {nodeId: $polygon})-[:intersectingBlocks]->(b:block)
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

app.get('/query/:city/:station/:polygon/block/', getBlockInPolygon);

//返回返回指定站点下的指定轮廓下的所有地块的指定属性
const getPropertyOfAllBlockInPolygon = async (req, res) => {
  console.log('2');
  const { station, polygon, property } = req.params;

  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (s:station {nodeId: $station})-[:containIso]->(p:staion_isochrone {nodeId: $polygon})-[:intersectingBlocks]->(b:block)
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


app.get('/query/:city/:station/:polygon/block/:property', getPropertyOfAllBlockInPolygon);

//返回指定站点下的指定轮廓下的指定地块的指定属性，属性的可选值在vue文件里的数组中定义，前端组织URL在80行，正常标志应该是选择好4个后，点击查询显示相应值
const getPropertyOfBlockInPolygon = async (req, res) => {
  console.log('1');
  const { station, polygon, block, property } = req.params;

  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (s:station {nodeId: $station})-[:containIso]->(p:staion_isochrone {nodeId: $polygon})-[:intersectingBlocks]->(b:block {nodeId: $block})
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

app.get('/query/:city/:station/:polygon/:block/:property', getPropertyOfBlockInPolygon);



//测试用，直接获取所有地块名字在加载时载入网页，效果与第一个api相同，为了减少卡顿，限制25个
const test_getAllBlock = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (b:block) RETURN b.nodeId LIMIT 25');
    const blockNames = result.records.map(record => record.get(0));
    res.send(blockNames);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching blocks');
  } finally {
    await session.close();
  }
};
app.get('/query/:city/block', test_getAllBlock);



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
