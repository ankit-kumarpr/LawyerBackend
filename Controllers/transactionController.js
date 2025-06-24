const Transaction = require('../Models/Transaction');
const Lawyer = require('../Models/Lawyer.Model');
const User = require('../Models/User.Model');

const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    
    const enrichedTransactions = await Promise.all(transactions.map(async t => {
      const lawyer = await Lawyer.findOne({ lawyerId: t.lawyerId });
      return {
        ...t._doc,
        lawyer: { name: lawyer?.name || 'Unknown', lawyerId: t.lawyerId }
      };
    }));
    
    res.json(enrichedTransactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getLawyerTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ lawyerId: req.user.lawyerId }).sort({ createdAt: -1 });
    
    const enrichedTransactions = await Promise.all(transactions.map(async t => {
      const user = await User.findOne({ userId: t.userId });
      return {
        ...t._doc,
        user: { name: user?.name || 'Unknown', userId: t.userId }
      };
    }));
    
    res.json(enrichedTransactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports={
    getUserTransactions,
    getLawyerTransactions
}
