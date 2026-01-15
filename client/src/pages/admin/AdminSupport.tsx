import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Mail, Send, Reply, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

export default function AdminSupport() {
  const [, setLocation] = useLocation();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New Email State
  const [newEmailTo, setNewEmailTo] = useState("");
  const [newEmailSubject, setNewEmailSubject] = useState("");
  const [newEmailBody, setNewEmailBody] = useState("");

  const utils = trpc.useUtils();

  // Queries
  const { data: messages, isLoading } = trpc.support.list.useQuery();

  // Mutations
  const replyMutation = trpc.support.reply.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال الرد بنجاح");
      setIsDialogOpen(false);
      setReplyText("");
      utils.support.list.invalidate();
    },
    onError: (err: any) => {
      toast.error(`فشل الإرسال: ${err.message}`);
    }
  });

  const sendEmailMutation = trpc.support.sendEmail.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال البريد الإلكتروني بنجاح");
      setNewEmailTo("");
      setNewEmailSubject("");
      setNewEmailBody("");
    },
    onError: (err: any) => {
      toast.error(`فشل الإرسال: ${err.message}`);
    }
  });

  useEffect(() => {
    const isAdmin = localStorage.getItem("adminToken");
    if (!isAdmin) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const handleReply = () => {
    if (!selectedMessage || !replyText.trim()) return;
    replyMutation.mutate({
      id: selectedMessage._id,
      reply: replyText
    });
  };

  const handleSendNewEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailTo || !newEmailSubject || !newEmailBody) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    sendEmailMutation.mutate({
      to: newEmailTo,
      subject: newEmailSubject,
      body: newEmailBody
    });
  };

  if (!localStorage.getItem("adminToken")) return null;

  return (
    <div className="min-h-screen bg-gray-100 font-sans" dir="rtl">
      {/* Sidebar */}
      <AdminSidebar activePath="/admin/support" />

      {/* Main Content */}
      <div className="lg:mr-72 lg:p-8 ml-0 p-4 transition-all duration-300">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">الدعم الفني</h1>

        <Tabs defaultValue="inbox" className="w-full">
          <TabsList className="mb-4 bg-white border">
            <TabsTrigger value="inbox" className="px-6">الرسائل الواردة</TabsTrigger>
            <TabsTrigger value="compose" className="px-6">إرسال رسالة جديدة</TabsTrigger>
          </TabsList>

          {/* Inbox Tab */}
          <TabsContent value="inbox">
            <Card>
              <CardHeader>
                <CardTitle>صندوق الوارد</CardTitle>
                <CardDescription>إدارة رسائل العملاء والرد عليها</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">الحالة</TableHead>
                          <TableHead className="text-right">الاسم</TableHead>
                          <TableHead className="text-right">الموضوع</TableHead>
                          <TableHead className="text-right">التاريخ</TableHead>
                          <TableHead className="text-right">إجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {messages.map((msg: any) => (
                          <TableRow key={msg._id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedMessage(msg); setIsDialogOpen(true); }}>
                            <TableCell>
                              {msg.status === 'replied' ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 flex w-fit items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> تم الرد
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 flex w-fit items-center gap-1">
                                  <AlertCircle className="h-3 w-3" /> جديد
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{msg.name}</TableCell>
                            <TableCell>{msg.subject}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {format(new Date(msg.createdAt), 'dd MMMM yyyy', { locale: arSA })}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">عرض التفاصيل</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>لا توجد رسائل جديدة</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compose Tab */}
          <TabsContent value="compose">
            <Card>
              <CardHeader>
                <CardTitle>إرسال بريد إلكتروني</CardTitle>
                <CardDescription>إرسال رسالة مباشرة إلى عميل</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendNewEmail} className="space-y-6 max-w-2xl">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">البريد الإلكتروني للمستلم</label>
                    <Input
                      type="email"
                      placeholder="example@domain.com"
                      value={newEmailTo}
                      onChange={(e) => setNewEmailTo(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الموضوع</label>
                    <Input
                      placeholder="عنوان الرسالة..."
                      value={newEmailSubject}
                      onChange={(e) => setNewEmailSubject(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">نص الرسالة</label>
                    <Textarea
                      placeholder="اكتب رسالتك هنا..."
                      className="min-h-[200px]"
                      value={newEmailBody}
                      onChange={(e) => setNewEmailBody(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={sendEmailMutation.isPending} className="gap-2">
                      {sendEmailMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      إرسال الرسالة
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Message Details & Reply Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصل الرسالة</DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6">
              {/* Message Info */}
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground ml-2">من:</span>
                    <span className="font-semibold">{selectedMessage.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground ml-2">البريد:</span>
                    <span className="font-mono">{selectedMessage.email}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground ml-2">الموضوع:</span>
                    <span className="font-semibold">{selectedMessage.subject}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground ml-2">التاريخ:</span>
                    <span>{format(new Date(selectedMessage.createdAt), 'PPP p', { locale: arSA })}</span>
                  </div>
                </div>
                <div className="pt-2 border-t mt-2">
                  <p className="whitespace-pre-wrap leading-relaxed text-gray-800">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {/* Previous Reply if exists */}
              {selectedMessage.reply && (
                <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> رد تم إرساله
                  </h4>
                  <p className="text-green-900 whitespace-pre-wrap text-sm">{selectedMessage.reply}</p>
                  <p className="text-xs text-green-600 mt-2">
                    تاريخ الرد: {selectedMessage.repliedAt && format(new Date(selectedMessage.repliedAt), 'PPP p', { locale: arSA })}
                  </p>
                </div>
              )}

              {/* Reply Form (Only if not already replied, or allow re-reply?) */}
              {/* Let's allow reply even if replied, to send another email? Use case says 'answer it'. Usually one-off. */}
              {/* But let's show reply box always maybe? Or hide if replied? status usually implies done. */}
              {/* Assuming one reply closes tickets for simplicity, but let's allow sending follow up */}

              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Reply className="h-4 w-4" /> الرد على الرسالة
                </h3>
                <Textarea
                  placeholder="اكتب ردك هنا... سيتم إرساله إلى بريد العميل"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
                  <Button onClick={handleReply} disabled={replyMutation.isPending || !replyText.trim()}>
                    {replyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "إرسال الرد"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
