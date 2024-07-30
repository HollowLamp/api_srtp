export const getAllStation = async (req, res) => {
  const session = driver.session();
  const result = await session.run('MATCH (n:Station) RETURN n.name');
  res.send(result.records.map(record => record.get(0)));
};
