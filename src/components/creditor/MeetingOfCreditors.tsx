import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  MinusCircle,
  FileText,
  Download,
  PlayCircle,
  PauseCircle,
  Vote,
  Scale,
  Gavel,
} from "lucide-react";
import { MeetingOfCreditors as MeetingType, CreditorVote } from "@/types/creditor";

interface MeetingOfCreditorsProps {
  meeting?: MeetingType;
  onScheduleMeeting: () => void;
  onStartMeeting: () => void;
  onRecordVote: (creditorId: string, vote: 'for' | 'against' | 'abstain') => void;
  onEndMeeting: () => void;
  onGenerateMinutes: () => void;
}

export function MeetingOfCreditors({
  meeting,
  onScheduleMeeting,
  onStartMeeting,
  onRecordVote,
  onEndMeeting,
  onGenerateMinutes,
}: MeetingOfCreditorsProps) {
  const [showVotingDialog, setShowVotingDialog] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (date: string, time: string) => {
    return new Date(`${date}T${time}`).toLocaleString('en-CA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateVotingResults = (votes: CreditorVote[]) => {
    const forVotes = votes.filter(v => v.vote === 'for');
    const againstVotes = votes.filter(v => v.vote === 'against');
    const abstainVotes = votes.filter(v => v.vote === 'abstain');

    const forAmount = forVotes.reduce((sum, v) => sum + v.claim_amount, 0);
    const againstAmount = againstVotes.reduce((sum, v) => sum + v.claim_amount, 0);
    const totalVotingAmount = forAmount + againstAmount;

    return {
      forCount: forVotes.length,
      againstCount: againstVotes.length,
      abstainCount: abstainVotes.length,
      forAmount,
      againstAmount,
      forPercentage: totalVotingAmount > 0 ? (forAmount / totalVotingAmount) * 100 : 0,
      againstPercentage: totalVotingAmount > 0 ? (againstAmount / totalVotingAmount) * 100 : 0,
    };
  };

  if (!meeting) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Gavel className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Meeting Scheduled</h3>
          <p className="text-muted-foreground mb-6">
            Schedule a Meeting of Creditors to begin the voting process
          </p>
          <Button onClick={onScheduleMeeting}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
        </CardContent>
      </Card>
    );
  }

  const results = calculateVotingResults(meeting.votes);
  const quorumPercentage = meeting.total_eligible_voters > 0
    ? (meeting.total_votes_cast / meeting.total_eligible_voters) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Meeting Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5" />
                Meeting of Creditors
              </CardTitle>
              <CardDescription className="mt-1">
                {meeting.meeting_type === 'first' ? 'First Meeting' : 
                 meeting.meeting_type === 'subsequent' ? 'Subsequent Meeting' : 'Special Meeting'}
              </CardDescription>
            </div>
            <Badge
              variant={
                meeting.status === 'completed' ? 'default' :
                meeting.status === 'in_progress' ? 'secondary' :
                meeting.status === 'cancelled' ? 'destructive' : 'outline'
              }
              className="capitalize"
            >
              {meeting.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">{formatDateTime(meeting.meeting_date, meeting.meeting_time)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{meeting.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Eligible Voters</p>
                <p className="font-medium">{meeting.total_eligible_voters}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {meeting.status === 'scheduled' && (
              <Button onClick={onStartMeeting}>
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Meeting
              </Button>
            )}
            {meeting.status === 'in_progress' && (
              <>
                <Dialog open={showVotingDialog} onOpenChange={setShowVotingDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Vote className="h-4 w-4 mr-2" />
                      Record Votes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Record Creditor Votes</DialogTitle>
                      <DialogDescription>
                        Record votes for each eligible creditor
                      </DialogDescription>
                    </DialogHeader>
                    {/* Voting interface would go here */}
                    <div className="text-center py-8 text-muted-foreground">
                      Voting interface placeholder
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" onClick={onEndMeeting}>
                  <PauseCircle className="h-4 w-4 mr-2" />
                  End Meeting
                </Button>
              </>
            )}
            {meeting.status === 'completed' && (
              <Button variant="outline" onClick={onGenerateMinutes}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Minutes
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quorum Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quorum Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {meeting.total_votes_cast} of {meeting.total_eligible_voters} creditors voted
              </span>
              <Badge variant={meeting.quorum_met ? 'default' : 'destructive'}>
                {meeting.quorum_met ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Quorum Met
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    No Quorum
                  </>
                )}
              </Badge>
            </div>
            <Progress value={quorumPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Total claim amount voting: {formatCurrency(meeting.total_claim_amount_voting)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Voting Results */}
      {meeting.votes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Voting Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 text-center">
                <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{results.forCount}</p>
                <p className="text-sm text-green-600">For</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(results.forAmount)} ({results.forPercentage.toFixed(1)}%)
                </p>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 text-center">
                <XCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{results.againstCount}</p>
                <p className="text-sm text-red-600">Against</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(results.againstAmount)} ({results.againstPercentage.toFixed(1)}%)
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted text-center">
                <MinusCircle className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-bold">{results.abstainCount}</p>
                <p className="text-sm text-muted-foreground">Abstain</p>
              </div>
            </div>

            {/* Vote Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creditor</TableHead>
                  <TableHead>Claim Amount</TableHead>
                  <TableHead>Vote</TableHead>
                  <TableHead>Proxy</TableHead>
                  <TableHead>Recorded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meeting.votes.map((vote, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{vote.creditor_name}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(vote.claim_amount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          vote.vote === 'for' ? 'default' :
                          vote.vote === 'against' ? 'destructive' : 'outline'
                        }
                        className="capitalize"
                      >
                        {vote.vote === 'for' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {vote.vote === 'against' && <XCircle className="h-3 w-3 mr-1" />}
                        {vote.vote === 'abstain' && <MinusCircle className="h-3 w-3 mr-1" />}
                        {vote.vote}
                      </Badge>
                    </TableCell>
                    <TableCell>{vote.proxy_holder || '-'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(vote.recorded_at).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Meeting Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start h-auto py-3">
              <FileText className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Notice of Meeting</p>
                <p className="text-xs text-muted-foreground">Auto-generated notice</p>
              </div>
              <Download className="h-4 w-4 ml-auto" />
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3">
              <FileText className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Meeting Agenda</p>
                <p className="text-xs text-muted-foreground">Standard agenda template</p>
              </div>
              <Download className="h-4 w-4 ml-auto" />
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3">
              <FileText className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Creditor List</p>
                <p className="text-xs text-muted-foreground">Eligible voters by claim amount</p>
              </div>
              <Download className="h-4 w-4 ml-auto" />
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" disabled={meeting.status !== 'completed'}>
              <FileText className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Meeting Minutes</p>
                <p className="text-xs text-muted-foreground">
                  {meeting.status === 'completed' ? 'Available for download' : 'Generated after meeting'}
                </p>
              </div>
              <Download className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
