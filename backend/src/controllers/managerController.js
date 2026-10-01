const prisma = require('../config/prisma');

async function getDirectReports(req, res) {
  try {
    const managerEmployee = req.user.employee;
    if (!managerEmployee) {
      return res.status(400).json({
        success: false,
        message: 'No associated employee record found for this manager.'
      });
    }

    const reports = await prisma.employee.findMany({
      where: {
        reportingManagerId: managerEmployee.id
      },
      include: {
        department: true,
        user: {
          select: { email: true, status: true }
        },
        onboardings: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            tasks: true,
            approvals: true,
            documents: true
          }
        }
      },
      orderBy: { joiningDate: 'desc' }
    });

    return res.status(200).json({
      success: true,
      directReports: reports
    });
  } catch (error) {
    console.error('Error fetching direct reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve direct reports.'
    });
  }
}

module.exports = {
  getDirectReports
};
