import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Lock, MapPin, Calendar, Clock, User, Phone, Mail, MessageSquare, CheckCircle2, XCircle, PackageCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

const ADMIN_PASSWORD = "Gran2026";

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  pickup_date: string;
  time_preference: string;
  additional_info: string | null;
  confirm_payment: boolean;
  picked_up: boolean;
  created_at: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    bookingId: string | null;
    bookingName: string;
    newStatus: boolean;
  }>({
    open: false,
    bookingId: null,
    bookingName: "",
    newStatus: false,
  });
  const navigate = useNavigate();

  // Check if already authenticated and load saved tab
  useEffect(() => {
    const authStatus = sessionStorage.getItem("admin_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      fetchBookings();
    }
    // Load saved tab from localStorage
    const savedTab = localStorage.getItem("admin_active_tab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Save active tab to localStorage when it changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem("admin_active_tab", value);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_authenticated", "true");
      setError("");
      fetchBookings();
    } else {
      setError("Fel lösenord. Försök igen.");
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    setPassword("");
    navigate("/");
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

      const response = await fetch(`${supabaseUrl}/functions/v1/get-bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseAnonKey}`,
          "apikey": supabaseAnonKey,
        },
        body: JSON.stringify({ password: ADMIN_PASSWORD }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Fel lösenord. Logga ut och försök igen.");
          setIsAuthenticated(false);
          sessionStorage.removeItem("admin_authenticated");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.error) {
        setError(result.error);
      } else {
        setBookings(result.bookings || []);
        setError("");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Ett fel uppstod vid hämtning av bokningar.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d MMMM", { locale: sv });
    } catch {
      return dateString;
    }
  };

  const handleTogglePickedUp = (bookingId: string, currentStatus: boolean, bookingName: string) => {
    setConfirmDialog({
      open: true,
      bookingId,
      bookingName,
      newStatus: !currentStatus,
    });
  };

  const confirmTogglePickedUp = async () => {
    if (!confirmDialog.bookingId) return;

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

      const response = await fetch(`${supabaseUrl}/functions/v1/update-booking-picked-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseAnonKey}`,
          "apikey": supabaseAnonKey,
        },
        body: JSON.stringify({ 
          password: ADMIN_PASSWORD,
          bookingId: confirmDialog.bookingId,
          pickedUp: confirmDialog.newStatus
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === confirmDialog.bookingId 
            ? { ...booking, picked_up: confirmDialog.newStatus }
            : booking
        )
      );

      setConfirmDialog({ open: false, bookingId: null, bookingName: "", newStatus: false });
    } catch (err) {
      console.error("Error updating picked up status:", err);
      setError("Kunde inte uppdatera hämtningsstatus.");
      setConfirmDialog({ open: false, bookingId: null, bookingName: "", newStatus: false });
    }
  };

  // Group bookings by date
  const bookingsByDate = bookings.reduce((acc, booking) => {
    const date = booking.pickup_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  // Get bookings for specific dates
  const date2025_01_02 = bookingsByDate["2025-01-02"] || [];
  const date2025_01_10 = bookingsByDate["2025-01-10"] || [];
  const date2025_01_17 = bookingsByDate["2025-01-17"] || [];

  // Helper function to get bookings for a date with picked up at bottom
  const getBookingsForDate = (dateBookings: Booking[]) => {
    const notPickedUp = dateBookings
      .filter(b => !b.picked_up)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const pickedUp = dateBookings
      .filter(b => b.picked_up)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return [...notPickedUp, ...pickedUp];
  };

  // All bookings sorted by created_at (newest first), with picked up at bottom
  const allBookings = [...bookings].sort((a, b) => {
    // First sort by picked_up (false first, so not picked up comes first)
    if (a.picked_up !== b.picked_up) {
      return a.picked_up ? 1 : -1;
    }
    // Then by created_at (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // All picked up bookings
  const pickedUpBookings = bookings.filter(b => b.picked_up);

  const renderBookingCard = (booking: Booking, isMobile: boolean = false) => {
    const isPickedUp = booking.picked_up;
    
    if (isMobile) {
      return (
        <Card 
          key={booking.id} 
          className={`overflow-hidden ${isPickedUp ? 'opacity-60 bg-muted/50 border-muted' : ''}`}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="space-y-3 sm:space-y-4">
              {/* Header with name, picked up checkbox, and payment status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <Checkbox
                      checked={isPickedUp}
                      onCheckedChange={() => handleTogglePickedUp(booking.id, isPickedUp, booking.name)}
                      className="flex-shrink-0"
                    />
                    <span className="text-[10px] sm:text-xs text-muted-foreground text-center leading-tight">
                      {isPickedUp ? "Hämtad" : "Hämta"}
                    </span>
                  </div>
                  <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <h3 className={`font-semibold text-base sm:text-lg truncate ${isPickedUp ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {booking.name}
                  </h3>
                  {isPickedUp && (
                    <PackageCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
                {booking.confirm_payment ? (
                  <div className="flex items-center gap-1.5 text-green-600 flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs sm:text-sm font-medium">Betalad</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-muted-foreground flex-shrink-0">
                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs sm:text-sm">Ej betald</span>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2 sm:space-y-2.5 pt-2 border-t">
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                  <a
                    href={`tel:${booking.phone}`}
                    className="text-primary hover:underline text-sm sm:text-base font-medium break-all"
                  >
                    {booking.phone}
                  </a>
                </div>
                {booking.email && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                    <a
                      href={`mailto:${booking.email}`}
                      className="text-primary hover:underline text-sm sm:text-base break-all"
                    >
                      {booking.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="flex items-start gap-2.5 pt-2 border-t">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base text-foreground leading-relaxed">
                  {booking.address}
                </span>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Datum</p>
                    <p className="text-sm sm:text-base font-medium text-foreground">
                      {formatDate(booking.pickup_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tid</p>
                    <p className="text-sm sm:text-base font-medium text-foreground">
                      {booking.time_preference}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {booking.additional_info && (
                <div className="flex items-start gap-2.5 pt-2 border-t">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Önskemål</p>
                    <p className="text-sm sm:text-base text-foreground leading-relaxed">
                      {booking.additional_info}
                    </p>
                  </div>
                </div>
              )}

              {/* Booking Date */}
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Bokad: {format(new Date(booking.created_at), "d MMM HH:mm", { locale: sv })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Desktop table row
    return (
      <TableRow 
        key={booking.id} 
        className={isPickedUp ? 'opacity-60 bg-muted/30' : ''}
      >
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <Checkbox
                checked={isPickedUp}
                onCheckedChange={() => handleTogglePickedUp(booking.id, isPickedUp, booking.name)}
              />
              <span className="text-[10px] text-muted-foreground text-center leading-tight whitespace-nowrap">
                {isPickedUp ? "Hämtad" : "Hämta"}
              </span>
            </div>
            <User className="h-4 w-4 text-muted-foreground" />
            <span className={isPickedUp ? 'line-through text-muted-foreground' : 'font-medium'}>
              {booking.name}
            </span>
            {isPickedUp && (
              <PackageCheck className="h-4 w-4 text-green-600" />
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <a
                href={`tel:${booking.phone}`}
                className="text-primary hover:underline"
              >
                {booking.phone}
              </a>
            </div>
            {booking.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <a
                  href={`mailto:${booking.email}`}
                  className="text-primary hover:underline"
                >
                  {booking.email}
                </a>
              </div>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-start gap-2 max-w-xs">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-sm">{booking.address}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatDate(booking.pickup_date)}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{booking.time_preference}</span>
          </div>
        </TableCell>
        <TableCell>
          {booking.additional_info ? (
            <div className="flex items-start gap-2 max-w-xs">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-sm">{booking.additional_info}</span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
        </TableCell>
        <TableCell>
          {booking.confirm_payment ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Betalad</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">Ej betald</span>
            </div>
          )}
        </TableCell>
        <TableCell>
          <span className="text-sm text-muted-foreground">
            {format(new Date(booking.created_at), "d MMM HH:mm", { locale: sv })}
          </span>
        </TableCell>
      </TableRow>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted p-4 sm:p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="px-4 pt-6 pb-4 sm:px-6 sm:pt-8 sm:pb-6">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
            </div>
            <CardTitle className="text-center text-xl sm:text-2xl">Admin-inloggning</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base mt-2">
              Ange lösenord för att komma åt bokningar
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-6 sm:px-6 sm:pb-8">
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div>
                <Input
                  type="password"
                  placeholder="Lösenord"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 sm:h-12 text-base"
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-sm text-destructive">{error}</p>
                )}
              </div>
              <Button type="submit" className="w-full h-11 sm:h-12 text-base font-medium">
                Logga in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <Card className="mb-4 sm:mb-6 border-2 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Bokningar - Granupphämtning
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Totalt:</span>
                    <span className="font-semibold text-foreground">{bookings.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Ej hämtade:</span>
                    <span className="font-semibold text-foreground">
                      {bookings.filter(b => !b.picked_up).length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PackageCheck className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">Hämtade:</span>
                    <span className="font-semibold text-green-600">
                      {bookings.filter(b => b.picked_up).length}
                    </span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base font-medium shadow-sm hover:shadow-md transition-shadow"
              >
                Logga ut
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12 sm:py-16">
              <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 sm:py-16 text-center text-muted-foreground text-sm sm:text-base">
              Inga bokningar hittades.
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <Card className="mb-4 sm:mb-6 shadow-md">
              <CardContent className="p-2 sm:p-3">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto bg-transparent gap-2">
                  <TabsTrigger 
                    value="all" 
                    className="text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-4 font-medium rounded-lg border-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-md transition-all hover:bg-muted"
                  >
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <span>Alla</span>
                      <span className="bg-muted text-foreground data-[state=active]:bg-background data-[state=active]:text-primary px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-semibold">
                        {bookings.length}
                      </span>
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="2025-01-02" 
                    className="text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-4 font-medium rounded-lg border-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-md transition-all hover:bg-muted"
                  >
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>2 jan</span>
                      <span className="bg-muted text-foreground data-[state=active]:bg-background data-[state=active]:text-primary px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-semibold">
                        {date2025_01_02.length}
                      </span>
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="2025-01-10" 
                    className="text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-4 font-medium rounded-lg border-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-md transition-all hover:bg-muted"
                  >
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>10 jan</span>
                      <span className="bg-muted text-foreground data-[state=active]:bg-background data-[state=active]:text-primary px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-semibold">
                        {date2025_01_10.length}
                      </span>
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="2025-01-17" 
                    className="text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-4 font-medium rounded-lg border-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-md transition-all hover:bg-muted"
                  >
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>17 jan</span>
                      <span className="bg-muted text-foreground data-[state=active]:bg-background data-[state=active]:text-primary px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-semibold">
                        {date2025_01_17.length}
                      </span>
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="picked-up" 
                    className="text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-4 font-medium rounded-lg border-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-md transition-all hover:bg-muted"
                  >
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <PackageCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Hämtade</span>
                      <span className="bg-muted text-foreground data-[state=active]:bg-background data-[state=active]:text-primary px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-semibold">
                        {pickedUpBookings.length}
                      </span>
                    </span>
                  </TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>

            {/* Alla bokningar */}
            <TabsContent value="all" className="mt-0">
              {allBookings.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <Card className="hidden md:block">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Hämtad</TableHead>
                              <TableHead>Namn</TableHead>
                              <TableHead>Kontakt</TableHead>
                              <TableHead>Adress</TableHead>
                              <TableHead>Datum</TableHead>
                              <TableHead>Tid</TableHead>
                              <TableHead>Önskemål</TableHead>
                              <TableHead>Betalning</TableHead>
                              <TableHead>Bokad</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allBookings.map((booking) => renderBookingCard(booking, false))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3 sm:space-y-4">
                    {allBookings.map((booking) => renderBookingCard(booking, true))}
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 sm:py-16 text-center text-muted-foreground text-sm sm:text-base">
                    Inga bokningar hittades.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 2 januari */}
            <TabsContent value="2025-01-02" className="mt-0">
              {date2025_01_02.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <Card className="hidden md:block">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Hämtad</TableHead>
                              <TableHead>Namn</TableHead>
                              <TableHead>Kontakt</TableHead>
                              <TableHead>Adress</TableHead>
                              <TableHead>Datum</TableHead>
                              <TableHead>Tid</TableHead>
                              <TableHead>Önskemål</TableHead>
                              <TableHead>Betalning</TableHead>
                              <TableHead>Bokad</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getBookingsForDate(date2025_01_02).map((booking) => renderBookingCard(booking, false))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3 sm:space-y-4">
                    {getBookingsForDate(date2025_01_02).map((booking) => renderBookingCard(booking, true))}
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 sm:py-16 text-center text-muted-foreground text-sm sm:text-base">
                    Inga bokningar för 2 januari.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 10 januari */}
            <TabsContent value="2025-01-10" className="mt-0">
              {date2025_01_10.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <Card className="hidden md:block">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Hämtad</TableHead>
                              <TableHead>Namn</TableHead>
                              <TableHead>Kontakt</TableHead>
                              <TableHead>Adress</TableHead>
                              <TableHead>Datum</TableHead>
                              <TableHead>Tid</TableHead>
                              <TableHead>Önskemål</TableHead>
                              <TableHead>Betalning</TableHead>
                              <TableHead>Bokad</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getBookingsForDate(date2025_01_10).map((booking) => renderBookingCard(booking, false))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3 sm:space-y-4">
                    {getBookingsForDate(date2025_01_10).map((booking) => renderBookingCard(booking, true))}
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 sm:py-16 text-center text-muted-foreground text-sm sm:text-base">
                    Inga bokningar för 10 januari.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 17 januari */}
            <TabsContent value="2025-01-17" className="mt-0">
              {date2025_01_17.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <Card className="hidden md:block">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Hämtad</TableHead>
                              <TableHead>Namn</TableHead>
                              <TableHead>Kontakt</TableHead>
                              <TableHead>Adress</TableHead>
                              <TableHead>Datum</TableHead>
                              <TableHead>Tid</TableHead>
                              <TableHead>Önskemål</TableHead>
                              <TableHead>Betalning</TableHead>
                              <TableHead>Bokad</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getBookingsForDate(date2025_01_17).map((booking) => renderBookingCard(booking, false))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3 sm:space-y-4">
                    {getBookingsForDate(date2025_01_17).map((booking) => renderBookingCard(booking, true))}
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 sm:py-16 text-center text-muted-foreground text-sm sm:text-base">
                    Inga bokningar för 17 januari.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Hämtade bokningar */}
            <TabsContent value="picked-up" className="mt-0">
              {pickedUpBookings.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <Card className="hidden md:block">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Hämtad</TableHead>
                              <TableHead>Namn</TableHead>
                              <TableHead>Kontakt</TableHead>
                              <TableHead>Adress</TableHead>
                              <TableHead>Datum</TableHead>
                              <TableHead>Tid</TableHead>
                              <TableHead>Önskemål</TableHead>
                              <TableHead>Betalning</TableHead>
                              <TableHead>Bokad</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pickedUpBookings.map((booking) => renderBookingCard(booking, false))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3 sm:space-y-4">
                    {pickedUpBookings.map((booking) => renderBookingCard(booking, true))}
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 sm:py-16 text-center text-muted-foreground text-sm sm:text-base">
                    Inga hämtade bokningar.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}

        {error && bookings.length > 0 && (
          <Card className="mt-3 sm:mt-4 border-destructive">
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm sm:text-base text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Bekräftelsedialog för hämtningsstatus */}
        <AlertDialog open={confirmDialog.open} onOpenChange={(open) => {
          if (!open) {
            setConfirmDialog({ open: false, bookingId: null, bookingName: "", newStatus: false });
          }
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                {confirmDialog.newStatus ? (
                  <>
                    <PackageCheck className="h-5 w-5 text-green-600" />
                    Markera som hämtad?
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                    Ångra hämtning?
                  </>
                )}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                {confirmDialog.newStatus ? (
                  <>
                    Är du säker på att du vill markera <strong>{confirmDialog.bookingName}</strong> som hämtad?
                    <br />
                    Bokningen kommer att flyttas till "Hämtade bokningar".
                  </>
                ) : (
                  <>
                    Är du säker på att du vill ångra hämtningen för <strong>{confirmDialog.bookingName}</strong>?
                    <br />
                    Bokningen kommer att flyttas tillbaka till listan.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Avbryt</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmTogglePickedUp}
                className={confirmDialog.newStatus ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {confirmDialog.newStatus ? "Ja, markera som hämtad" : "Ja, ångra hämtning"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Admin;

