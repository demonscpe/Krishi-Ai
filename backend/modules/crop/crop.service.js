const CropHistory = require("./crop.model");

exports.saveResult = async (userId, data) => {
  return await CropHistory.create({ userId, ...data });
};

exports.getHistory = async (userId) => {
  return await CropHistory.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit: 20,
  });
};

exports.deleteHistory = async (userId, id) => {
  const record = await CropHistory.findOne({ where: { id, userId } });
  if (!record) throw new Error('Not found');
  return await record.destroy();
};
