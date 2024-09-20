import express from 'express';
import { getAllStation, getPolyonOfStation, getBlockInPolygon, getPropertyOfAllBlockInPolygon, getPropertyOfBlockInPolygon, getEntranceLocations, getAllCities } from './controllers.js';

const router = express.Router();

// 获取所有城市列表
router.get('/query/cities', getAllCities);

// 获取所有站点名称
router.get('/query/:city/station', getAllStation);

// 获取指定站点的出入口信息
router.get('/query/:city/:station/entrance_locations', getEntranceLocations);

// 获取指定站点名称的指定等时圈的轮廓属性
router.get('/query/:city/:station/:polygon', getPolyonOfStation);

// 获取指定站点下的指定轮廓下的所有地块的名称
router.get('/query/:city/:station/:polygon/block', getBlockInPolygon);

// 获取指定站点下的指定轮廓下的所有地块的指定属性
router.get('/query/:city/:station/:polygon/block/:property', getPropertyOfAllBlockInPolygon);

// 获取指定站点下的指定轮廓下的指定地块的指定属性
router.get('/query/:city/:station/:polygon/:block/:property', getPropertyOfBlockInPolygon);

export default router;
