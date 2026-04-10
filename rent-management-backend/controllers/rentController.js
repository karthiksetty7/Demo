import RentEntry from "../models/RentEntry.js";
import Tenant from "../models/Tenant.js";


export const getRentEntries = async (req, res) => {
  try {
    const entries = await RentEntry.findAll({
      include: [
        {
          model: Tenant,
          as: "tenant",
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json(entries);
  } catch (error) {
    res.status(500).json(error.message);
  }
};


export const createRentEntry = async (req, res) => {
  try {
    const entry = await RentEntry.create(req.body);
    res.json(entry);
  } catch (error) {
    res.status(500).json(error.message);
  }
};


export const updateRentEntry = async (req, res) => {
  try {
    const { id } = req.params;

    await RentEntry.update(req.body, {
      where: { id },
    });

    const updated = await RentEntry.findByPk(id);

    res.json(updated);
  } catch (error) {
    res.status(500).json(error.message);
  }
};


export const deleteRentEntry = async (req, res) => {
  try {
    const { id } = req.params;

    await RentEntry.destroy({
      where: { id },
    });

    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json(error.message);
  }
};
