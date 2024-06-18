import React, { useEffect, useState } from "react";
import {
  View,
  Text,Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ClockIcon } from "react-native-heroicons/outline";
import { format } from "date-fns";
import { CheckCircleIcon } from "react-native-heroicons/solid";
import { Action, ChallengeData, Customer } from "../models/ChallengeData";


export default function Calendar() {
  const [events, setEvents] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   const [customer, setCustomer] = useState<ChallengeData["customer"] | null>(
     null
   );
  const iconImage = require("../../assets/images/Vector.png");

  useEffect(() => {
    fetch(
      "https://xjvq5wtiye.execute-api.us-east-1.amazonaws.com/interview/api/v1/challenge"
    )
      .then((response) => response.json())
      .then((data: ChallengeData) => {
        const extractedEvents: Action[] = data.calendar.flatMap(
          (monthData) => monthData.actions
        );

        extractedEvents.sort((a, b) => {
          if (!a.scheduledDate || !b.scheduledDate) return 0;
          return (
            new Date(a.scheduledDate).getTime() -
            new Date(b.scheduledDate).getTime()
          );
        });

        setEvents(extractedEvents);
        setCustomer(data.customer);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Error fetching data. Please try again later.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>
          {error}
        </Text>
      </View>
    );
  }

  const groupEventsByMonthYear = (events: Action[]) => {
    const groupedEvents: { [key: string]: Action[] } = {};

    events.forEach((event) => {
      const date = event.scheduledDate ? new Date(event.scheduledDate) : null;
      const monthYear = date ? format(date, "MMMM yyyy") : "No Date";

      if (!groupedEvents[monthYear]) {
        groupedEvents[monthYear] = [];
      }

      groupedEvents[monthYear].push(event);
    });

    return groupedEvents;
  };

  const groupedEvents = groupEventsByMonthYear(events);

  const getEventStyle = (status: string) => {
    switch (status) {
      case "Completed":
        return styles.completedEvent;
      case "Scheduled":
        return styles.scheduledEvent;
      case "Unscheduled":
        return styles.unscheduledEvent;
      default:
        return styles.defaultEvent;
    }
  };

  const renderEventItems = (events: Action[]) => (
    <View>
      {events.map((event) => (
        <View key={event.id} style={styles.eventWrapper}>
          <View style={styles.leftContainer}>
            <Text style={styles.categoryText}>
              {event.status === "Scheduled" && "TUE"}{" "}
             
              {event.status === "Completed" && "WED"}{" "}
              
              {event.status === "Unscheduled" && "TBD"}{" "}
             
            </Text>
            <Text style={styles.leftText}>
              {event.scheduledDate
                ? format(new Date(event.scheduledDate), "dd")
                : ""}
            </Text>
            {event.status === "Completed" && (
              <CheckCircleIcon size={24} color="#00B47D" />
            )}
            {event.status === "Scheduled" && (
              <ClockIcon size={24} color="#00B47D" />
            )}
          </View>
          <View style={[styles.eventContainer, getEventStyle(event.status)]}>
            <View style={styles.rightContainer}>
              <Text style={styles.whiteTextTitle}>{event.name}</Text>
              <Text style={styles.whiteTextVendor}>
                {event.vendor?.vendorName}
              </Text>
              <Text style={styles.whiteTextNumber}>
                {event.vendor?.phoneNumber}
              </Text>

              <View style={styles.whiteTextStreet}>
                <Image source={iconImage} style={styles.icon} />
                <Text style={styles.whiteTextSteet}>{customer?.street}</Text>
              </View>
              <Text style={styles.whiteText}> {event.status}</Text>
              {event.status === "Scheduled" && (
                <Text
                  style={styles.whiteText}
                >{`Arrival Window: ${event.arrivalStartWindow} - ${event.arrivalEndWindow}`}</Text>
              )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Calendar</Text>
      <View style={styles.line} />
      {Object.keys(groupedEvents).map((monthYear) => (
        <View key={monthYear}>
          <Text style={styles.monthHeader}>{monthYear}</Text>
          {groupedEvents[monthYear].length > 0 ? (
            renderEventItems(groupedEvents[monthYear])
          ) : (
            <View style={styles.noMaintenanceContainer}>
              <Text style={styles.noMaintenanceText}>
                No Maintenance Scheduled
              </Text>
            </View>
          )}
        </View>
      ))}
      {events.length === 0 && (
        <Text style={styles.noEvents}>No events available.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 16,
   paddingTop:70,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#0f0f0fcc",
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: "#dcdcdc",
    marginBottom: 20,
  },
  monthHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 15,
paddingBottom:5,
    color: "#0f0f0fcc",
  },
  eventWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  categoryText: {
    fontSize: 9,
    fontWeight:'black'
  },
  leftContainer: {
    marginRight: 10,
    alignItems: "center",
  },
  leftText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f0f0fcc",
  },
  whiteTextTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  whiteTextVendor: {
    color: "white",
    fontSize: 12,
    fontWeight: "regular",
  },
  whiteTextNumber: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  whiteTextSteet: {
    color: "white",
    fontSize: 12,
    paddingLeft:4,
    fontWeight: "regular",
    paddingTop: 10,
  },
  whiteTextStreet: {
    color: "#fff",
    flexDirection: "row", 
    alignItems: "center", 
  },
  icon: {
    width: 7, 
    height:10, 
    marginLeft: 5, 
 marginTop:8
  },
  whiteText: {
    color: "white",
    fontSize: 12,
  },
  eventContainer: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completedEvent: {
    backgroundColor: "#00B47D",
  },
  scheduledEvent: {
    backgroundColor: "#006A4B",
  },
  unscheduledEvent: {
    backgroundColor: "#011638",
  },
  defaultEvent: {
    backgroundColor: "#848FA5",
  },
  rightContainer: {
    flex: 1,
    marginLeft: 10,
  },
  noEvents: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  noMaintenanceContainer: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
  },
  noMaintenanceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#757575",
  },
});