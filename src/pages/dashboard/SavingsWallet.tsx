import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PiggyBank, ArrowUpRight, Loader2, History } from 'lucide-react';
import { getSavingsWallet, getSavingsWalletHistory } from '@/services/userService';
import { formatDateIST } from '@/lib/dateUtils';

interface SavingsSummary {
  balance: number;
  totalCredited: number;
}

interface SavingsCredit {
  _id: string;
  sourceType: string;
  grossAmount: number;
  percent: number;
  amount: number;
  balanceAfter: number;
  createdAt: string;
  createdAt_IST?: string;
}

const SavingsWallet = () => {
  const [summary, setSummary] = useState<SavingsSummary>({ balance: 0, totalCredited: 0 });
  const [history, setHistory] = useState<SavingsCredit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [walletData, historyData] = await Promise.all([
        getSavingsWallet(),
        getSavingsWalletHistory(),
      ]);
      setSummary({
        balance: walletData?.balance || 0,
        totalCredited: walletData?.totalCredited || 0,
      });
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (error) {
      console.error('Error fetching savings wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSourceType = (type: string): string =>
    (type || '')
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Savings Wallet</h1>
        <p className="text-muted-foreground">
          An extra 10% of every income's gross amount is auto-deposited here.
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
            <PiggyBank className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ₹{summary.balance.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Credited</CardTitle>
            <ArrowUpRight className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ₹{summary.totalCredited.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <History className="h-5 w-5" /> Credit History
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchData}>Refresh</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Source Income</TableHead>
                  <TableHead className="text-right text-muted-foreground">Gross</TableHead>
                  <TableHead className="text-right text-muted-foreground">Credited (10%)</TableHead>
                  <TableHead className="text-right text-muted-foreground">Balance After</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No savings credits yet
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell className="whitespace-nowrap text-foreground">
                        {formatDateIST(row.createdAt_IST || row.createdAt)}
                      </TableCell>
                      <TableCell className="text-foreground">{formatSourceType(row.sourceType)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        ₹{(row.grossAmount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        +₹{(row.amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        ₹{(row.balanceAfter || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SavingsWallet;
