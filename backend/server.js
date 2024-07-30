//参照网站的服务器代码逻辑，server将路由分配，实现部分单独放在另外的文件
import express from 'express';
import cors from 'cors';
import neo4j from 'neo4j-driver';
//这里写外部导入，一个人单独写一个api文件避免修改冲突
//import { getAllStation, getPolyonOfStation } from './api1.js';
//import { getPropertyOfAllBlockInPolygon, getPropertyOfBlockInPolygon } from './api2.js';

const app = express();
const PORT = 3001;
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '12345678'));



app.use(cors());

//路由对应函数，:代表这个部分的值是动态获取的

//可以先在电脑上运行一下前端后端，测试一下下方的test_AllBlock能否正常运行，标志是网站上的第四个框点开有内容
//遇到问题可以排查数据库连接的端口，用户名，密码是否正确，后端和前端的PORT是不是一样的
//写查询时可以先在neo4j浏览器里验证一下


//返回所有站点名称，城市可以忽略，目前只有南京，前端组织URL在VUE文件59行，完成后需要取消注释VUE文件95行，正常标志应该是网页第一个框打开有内容
//app.get('/query/:city/station', getAllStation);
//返回指定站点名称的制定等时圈的轮廓属性，前端组织URL在77行，正常标志应该是选择好前两个框后点击查询，显示此轮廓的多边形属性
//app.get('/query/:city/:station/:polygon', getPolyonOfStation);
//返回指定站点下的指定轮廓下的指定地块的指定属性，属性的可选值在vue文件里的数组中定义，前端组织URL在80行，正常标志应该是选择好4个后，点击查询显示相应值
//app.get('/query/:city/:station/:polygon/:block/:property', getPropertyOfBlockInPolygon);
//返回....，前端组织URL在82行，正常标志应该是选择好前3个后，点击查询显示区域内所有地块的相应值
//app.get('/query/:city/:station/:polygon/block/:property', getPropertyOfAllBlockInPolygon);

//vue代码在/frontend/src/componets下，可能有错，如果发现问题或验证的时候有问题及时提醒我

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

//检查网站逻辑发现还需要一种api，因为station还没有，暂时无法测试整体正确性，但是这个sql查询是正确的，可以参考一下
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
