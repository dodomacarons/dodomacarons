import express from 'express';
import { Waste } from './schemas/Waste';
import cors from 'cors';
import mongoose from 'mongoose';
import { DateTime } from 'luxon';

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? +process.env.PORT : 4201;
const mongoConnectionString = process.env.MONGO_DB_CONNECTION_STRING ?? '';

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:4200',
      'https://spiffy-jelly-837cfe.netlify.app',
    ],
  })
);
app.use(express.json());

mongoose
  .connect(mongoConnectionString)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.get('/api/waste', async (req, res) => {
  try {
    const { displayDate, flavor } = req.query;
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

    const wastes = await Waste.find(filter).limit(100);
    res
      .status(200)
      .json({ message: 'Wastes retrieved successfully', data: wastes });
  } catch (error) {
    console.error('Error fetching wastes:', error);
    res.status(500).json({ message: 'Error fetching waste entries', error });
  }
});

app.get('/api/aggregate1', async (req, res) => {
  try {
    const { displayDateFrom, displayDateTo } = req.query;
    const start = DateTime.fromISO(displayDateFrom as string)
      .startOf('day')
      .toJSDate();
    const end = DateTime.fromISO(displayDateTo as string)
      .endOf('day')
      .toJSDate();

    const result = await Waste.aggregate([
      {
        $match: {
          displayDate: { $gte: start, $lte: end },
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
    res
      .status(200)
      .json({ message: 'Wastes retrieved successfully', data: result });
  } catch (error) {
    console.error('Error fetching wastes:', error);
    res.status(500).json({ message: 'Error fetching waste entries', error });
  }
});

app.post('/api/waste', async (req, res) => {
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

    res
      .status(201)
      .json({ message: 'Waste entry created successfully', data: newWaste });
  } catch (error) {
    console.error('Error creating waste entry:', error);
    res.status(500).json({
      message: 'Error creating waste entry',
      error: (error as Error).message,
    });
  }
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
