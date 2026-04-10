import Bill from '../models/Bill.js';

const generateBillNumber = () => {
  return 'BILL-' + Date.now();
};

export const getBills = async (req, res) => {
  try {
    const bills = await Bill.findAll({
      include: [
        { association: 'tenant', required: false },
        { association: 'building', required: false },
        { association: 'floor', required: false },
        { association: 'room', required: false },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bills' });
  }
};

export const addBill = async (req, res) => {
  try {
    const bill = await Bill.create({
      ...req.body,
      bill_number: generateBillNumber(),
      generated_date: new Date(),
    });

    res.json(bill);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error creating bill' });
  }
};

export const updateBill = async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id);

    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    await bill.update(req.body);

    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: 'Error updating bill' });
  }
};

export const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id);

    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    await bill.destroy();

    res.json({ message: 'Bill deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting bill' });
  }
};

export const getLastBill = async (req, res) => {
  try {
    const { tenantId } = req.query;

    const bill = await Bill.findOne({
      where: { tenant_id: tenantId },
      order: [['createdAt', 'DESC']],
    });

    res.json(bill || {});
  } catch (err) {
    res.status(500).json({ message: 'Error fetching last bill' });
  }
};
