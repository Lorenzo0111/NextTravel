import { honoClient } from "@/components/fetcher";
import { SafeAreaView } from "@/components/injector";
import { LimitScreen } from "@/components/plan/LimitScreen";
import { PlanStep } from "@/components/plan/PlanStep";
import { ErrorScreen, LoadingScreen } from "@/components/ui/Screens";
import { type DateType, dateEquals, parseDate } from "@/components/utils/dates";
import { useQuery } from "@tanstack/react-query";
import type { responseType } from "api";
import { useLocalSearchParams } from "expo-router";
import { FlatList, View } from "react-native";
import { Agenda } from "react-native-calendars";

const CalendarPage = () => {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ["plan", id],
    queryFn: async () => {
      const res = await honoClient.plan[":id"].$get({
        param: {
          id: id as string,
        },
      });

      const data = await res.json();
      if ("t" in data) throw new Error(data.t);

      return {
        ...data,
        response: data.response as responseType,
      };
    },
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  if (isLoading || !data?.response) return <LoadingScreen />;
  if (error && error.message === "month_limit") return <LimitScreen />;
  if (error) return <ErrorScreen error={error.message} />;

  return (
    <SafeAreaView className="flex flex-1 flex-col bg-background px-0">
      <Agenda
        minDate={
          parseDate(data.response.plan[0].date as DateType, true)
            .toISOString()
            .split("T")[0]
        }
        maxDate={
          parseDate(
            data.response.plan[data.response.plan.length - 1].date as DateType,
            true,
          )
            .toISOString()
            .split("T")[0]
        }
        selected={
          parseDate(data.response.plan[0].date as DateType, true)
            .toISOString()
            .split("T")[0]
        }
        renderList={(list: { selectedDay: string }) => {
          return (
            <FlatList
              data={data.response.plan.filter((item) => {
                return dateEquals(
                  parseDate(item.date as DateType),
                  new Date(list.selectedDay),
                );
              })}
              renderItem={({ item }) => (
                <View className="my-1">
                  <PlanStep key={item.title} {...item} />
                </View>
              )}
              keyExtractor={(item) => `${item.title}-${item.date}`}
            />
          );
        }}
        markedDates={{
          ...data.response.plan.reduce((acc, item) => {
            const date = parseDate(item.date as DateType);
            const month = date.getMonth().toString().padStart(2, "0");
            const dateString = `${date.getFullYear()}-${month}-${date.getDate()}`;

            return {
              // biome-ignore lint/performance/noAccumulatingSpread: This is a small object
              ...acc,
              [dateString]: {
                marked: true,
              },
            };
          }, {}),
        }}
      />
    </SafeAreaView>
  );
};

export default CalendarPage;
