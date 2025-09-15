import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import WebsiteRoutes from './routes/websiteRoute/websiteroute.js';
import authRoutes from './routes/authRoute/authroute.js';
import escalationPolicyRoutes from './routes/escalationRoute/escalationPoliciesRoute.js';
import organizationRoutes from './routes/organizationRoutes/organizationRoutes.js';
import teamRoutes from './routes/team-sectionRoutes/team/teamRoutes.js';
import roleRoutes from './routes/team-sectionRoutes/roles/roleRoutes.js';
import userRoutes from './routes/userRoute/userRoutes.js';
import onCallRoutes from './routes/oncallRoute/oncallRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello from API!');
});

app.use('/api/auth', authRoutes);
app.use('/api/website', WebsiteRoutes);
app.use('/api/escalation-policies', escalationPolicyRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/oncall', onCallRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
