import express from 'express';
import { Waste } from './schemas/Waste';
import cors from 'cors';
import mongoose from 'mongoose';
import { DateTime } from 'luxon';
import { authMiddleware } from './auth.middleware';

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? +process.env.PORT : 4201;
const mongoConnectionString = process.env.MONGO_DB_CONNECTION_STRING ?? '';

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:4200',
      'https://spiffy-jelly-837cfe.netlify.app',
      'https://dodomacarons.duckdns.org',
      'https://dodomacarons.onrender.com',
    ],
  })
);
app.use(express.json());

mongoose
  .connect(mongoConnectionString)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

app.get('/', (req, res) => {
  return res.send({ message: 'Hello API' });
});

app.get('/api/waste', authMiddleware, async (req, res) => {
  try {
    const { displayDate, flavor } = req.query;
    const page = parseInt(req.query.page as string, 10) || 0;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 100;
    const sortModel = req.query.sortModel
      ? JSON.parse((req.query.sortModel as string) || '[]')
      : [];
    const filter: any = {};

    if (displayDate) {
      const start = DateTime.fromISO(displayDate as string)
        .startOf('day')
        .toJSDate();
      const end = DateTime.fromISO(displayDate as string)
        .endOf('day')
        .toJSDate();

      filter.displayDate = { $gte: start, $lte: end };
    }

    if (flavor) {
      filter.flavor = flavor;
    }

    const sort: any = {};
    if (Array.isArray(sortModel) && sortModel.length > 0) {
      sortModel.forEach(({ field, sort: direction }) => {
        sort[field] = direction === 'asc' ? 1 : -1;
      });
    }

    const total = await Waste.countDocuments(filter);
    const wastes = await Waste.find(filter)
      .skip(page * pageSize)
      .sort(sort)
      .limit(pageSize);

    return res.status(200).json({
      message: 'Wastes retrieved successfully',
      data: wastes,
      total,
    });
  } catch (error) {
    console.error('Error fetching wastes:', error);
    return res
      .status(500)
      .json({ message: 'Error fetching waste entries', error });
  }
});

app.get('/api/aggregate1', authMiddleware, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const start = DateTime.fromISO(dateFrom as string)
      .startOf('day')
      .toJSDate();
    const end = DateTime.fromISO(dateTo as string)
      .endOf('day')
      .toJSDate();

    const result = await Waste.aggregate([
      {
        $match: {
          manufacturingDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$flavor',
          totalManufacturingWaste: { $sum: '$manufacturingWasteQuantity' },
          totalShippingWaste: { $sum: '$shippingWasteQuantity' },
          totalDisplayed: { $sum: '$displayedQuantity' },
        },
      },
      {
        $project: {
          flavor: '$_id',
          _id: 0,
          totalManufacturingWaste: 1,
          totalShippingWaste: 1,
          totalDisplayed: 1,
          totalWaste: {
            $add: ['$totalManufacturingWaste', '$totalShippingWaste'],
          },
          wasteRatio: {
            $cond: [
              { $eq: ['$totalDisplayed', 0] },
              0,
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          {
                            $add: [
                              '$totalManufacturingWaste',
                              '$totalShippingWaste',
                            ],
                          },
                          '$totalDisplayed',
                        ],
                      },
                      100,
                    ],
                  },
                  2,
                ],
              },
            ],
          },
        },
      },
      {
        $sort: { flavor: 1 },
      },
    ]);
    return res
      .status(200)
      .json({ message: 'Wastes retrieved successfully', data: result });
  } catch (error) {
    console.error('Error fetching wastes:', error);
    return res
      .status(500)
      .json({ message: 'Error fetching waste entries', error });
  }
});

app.get('/api/aggregate2', authMiddleware, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const start = DateTime.fromISO(dateFrom as string)
      .startOf('day')
      .toJSDate();
    const end = DateTime.fromISO(dateTo as string)
      .endOf('day')
      .toJSDate();

    const result = await Waste.aggregate([
      {
        $match: {
          manufacturingDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$manufacturingDate',
          totalManufacturingWaste: { $sum: '$manufacturingWasteQuantity' },
          totalShippingWaste: { $sum: '$shippingWasteQuantity' },
        },
      },
      {
        $project: {
          manufacturingDate: '$_id',
          _id: 0,
          totalManufacturingWaste: 1,
          totalShippingWaste: 1,
          totalWaste: {
            $add: ['$totalManufacturingWaste', '$totalShippingWaste'],
          },
        },
      },
      {
        $sort: { manufacturingDate: 1 },
      },
    ]);
    return res
      .status(200)
      .json({ message: 'Wastes retrieved successfully', data: result });
  } catch (error) {
    console.error('Error fetching wastes:', error);
    return res
      .status(500)
      .json({ message: 'Error fetching waste entries', error });
  }
});

app.post('/api/waste', authMiddleware, async (req, res) => {
  try {
    const {
      manufacturingDate,
      releaseDate,
      displayDate,
      flavor,
      displayedQuantity,
      manufacturingWasteQuantity,
      manufacturingWasteReason,
      shippingWasteQuantity,
    } = req.body;

    const newWaste = new Waste({
      manufacturingDate,
      releaseDate,
      displayDate,
      flavor,
      displayedQuantity,
      manufacturingWasteQuantity,
      manufacturingWasteReason,
      shippingWasteQuantity,
    });

    await newWaste.save();

    return res
      .status(201)
      .json({ message: 'Waste entry created successfully', data: newWaste });
  } catch (error) {
    console.error('Error creating waste entry:', error);
    return res.status(500).json({
      message: 'Error creating waste entry',
      error: (error as Error).message,
    });
  }
});

app.patch('/api/waste/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    const updatedWaste = await Waste.findByIdAndUpdate(
      id,
      {
        ...updates,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedWaste) {
      return res.status(404).json({ error: 'Waste not found' });
    }

    return res.json({
      message: 'Waste entry updated successfully',
      data: updatedWaste,
    });
  } catch (error) {
    console.error('Error updating waste entry:', error);
    return res.status(500).json({
      message: 'Error updating waste entry',
      error: (error as Error).message,
    });
  }
});

app.delete('/api/waste/:id', authMiddleware, async (req, res) => {
  try {
    const result = await Waste.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    return res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting waste entry:', error);
    return res.status(500).json({
      message: 'Error deleting waste entry',
      error: (error as Error).message,
    });
  }
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
