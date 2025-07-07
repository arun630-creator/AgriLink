
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, DollarSign, Calendar, Download, Eye, BarChart3 } from "lucide-react";

const FarmerEarnings = () => {
  const earningsData = {
    totalEarnings: 45680,
    thisMonth: 8950,
    pending: 2340,
    lastPayout: 6750
  };

  const monthlyEarnings = [
    { month: "January", amount: 8950, orders: 23, growth: 12 },
    { month: "December", amount: 7850, orders: 19, growth: -5 },
    { month: "November", amount: 8290, orders: 21, growth: 8 },
    { month: "October", amount: 7650, orders: 18, growth: 15 },
    { month: "September", amount: 6720, orders: 16, growth: 3 },
    { month: "August", amount: 6490, orders: 15, growth: -2 }
  ];

  const recentTransactions = [
    {
      id: "TXN001",
      type: "Payment Received",
      amount: 1250,
      date: "2024-01-16",
      status: "completed",
      orderId: "ORD-001"
    },
    {
      id: "TXN002",
      type: "Payment Received",
      amount: 890,
      date: "2024-01-15",
      status: "completed",
      orderId: "ORD-002"
    },
    {
      id: "TXN003",
      type: "Pending Payment",
      amount: 2340,
      date: "2024-01-14",
      status: "pending",
      orderId: "ORD-003"
    }
  ];

  const payoutHistory = [
    { date: "2024-01-10", amount: 6750, method: "Bank Transfer", status: "Completed" },
    { date: "2024-01-03", amount: 5430, method: "Bank Transfer", status: "Completed" },
    { date: "2023-12-27", amount: 7890, method: "Bank Transfer", status: "Completed" }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">💰 Earnings Dashboard</h1>
            <p className="text-gray-600">Track your income and payment history</p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="2024">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Earnings Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{earningsData.totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time earnings</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">₹{earningsData.thisMonth.toLocaleString()}</div>
              <p className="text-xs text-green-600">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">₹{earningsData.pending.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Payout</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">₹{earningsData.lastPayout.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Jan 10, 2024</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Earnings */}
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle>📊 Monthly Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyEarnings.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{month.month}</h4>
                      <p className="text-sm text-gray-500">{month.orders} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">₹{month.amount.toLocaleString()}</p>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs ${month.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {month.growth >= 0 ? '+' : ''}{month.growth}%
                        </span>
                        <TrendingUp className={`h-3 w-3 ${month.growth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border-blue-100">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>💳 Recent Transactions</CardTitle>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{transaction.type}</h4>
                      <p className="text-sm text-gray-500">Order: {transaction.orderId}</p>
                      <p className="text-xs text-gray-400">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">₹{transaction.amount}</p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payout History */}
        <Card className="mt-8 border-purple-100">
          <CardHeader>
            <CardTitle>🏦 Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Method</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutHistory.map((payout, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{new Date(payout.date).toLocaleDateString()}</td>
                      <td className="p-2 font-semibold text-green-600">₹{payout.amount.toLocaleString()}</td>
                      <td className="p-2">{payout.method}</td>
                      <td className="p-2">
                        <Badge className="bg-green-100 text-green-800">{payout.status}</Badge>
                      </td>
                      <td className="p-2">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-2">💸 Request Payout</h3>
              <p className="text-green-700 mb-4">Minimum payout amount: ₹1,000</p>
              <Button className="bg-green-600 hover:bg-green-700">
                Request Payout
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">📈 Earnings Report</h3>
              <p className="text-blue-700 mb-4">Download detailed earnings report</p>
              <Button variant="outline" className="border-blue-600 text-blue-600">
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FarmerEarnings;
