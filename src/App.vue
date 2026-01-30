<template>
  <div class="zodiac-query">
    <!-- 标题 -->
    <div class="query-title">《采真相历》查看自己是属啥的（200年精准版）</div>

    <!-- 下拉框选择区域（切换年月）+ 新增箭头切换 -->
    <div class="date-selector">
      <!-- 年份切换区域（箭头+下拉框） -->
      <div class="date-switch-group">
        <!-- 上一年箭头 -->
        <button class="arrow-btn prev-year" @click="switchYear(-1)" aria-label="上一年">
          <span class="triangle left"></span>
        </button>
        <select v-model="year" @change="refreshCalendarAndCalculate">
          <option v-for="y in yearRange" :key="y" :value="y">{{ y }}年</option>
        </select>
        <!-- 下一年箭头 -->
        <button class="arrow-btn next-year" @click="switchYear(1)" aria-label="下一年">
          <span class="triangle right"></span>
        </button>
      </div>

      <!-- 月份切换区域（箭头+下拉框） -->
      <div class="date-switch-group">
        <!-- 上一月箭头 -->
        <button class="arrow-btn prev-month" @click="switchMonth(-1)" aria-label="上一月">
          <span class="triangle left"></span>
        </button>
        <select v-model="month" @change="refreshCalendarAndCalculate">
          <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
        </select>
        <!-- 下一月箭头 -->
        <button class="arrow-btn next-month" @click="switchMonth(1)" aria-label="下一月">
          <span class="triangle right"></span>
        </button>
      </div>
    </div>

    <!-- 新增：显示当年立春日期，直观看到分界点 -->
    <div class="lichun-tip" v-if="lichunText">
      {{ year }}年立春：{{ lichunText }} 【年属切换分界点】
    </div>

    <!-- 日历网格组件（公历+农历+节气标注） -->
    <div class="calendar-grid">
      <div class="calendar-header">
        <span class="calendar-title">{{ year }}年{{ month }}月</span>
      </div>
      <div class="calendar-days">
        <button
          v-for="d in getDayRange"
          :key="d"
          class="day-btn"
          :class="{ active: day === d, lichun: isLichunDay(year, month, d) }"
          @click="handleDayClick(d)"
        >
          <span class="solar-day">{{ d }}</span>
          <span class="lunar-day">{{ getLunarDayText(year, month, d) }}</span>
          <span class="jieqi-tag" v-if="getJieQiText(year, month, d)">{{ getJieQiText(year, month, d) }}</span>
        </button>
      </div>
    </div>

    <!-- 生肖属性显示区域 -->
    <div class="zodiac-result" v-if="showResult">
      <div class="lunar-full-info">
        农历：{{ lunarShortText || "——" }}
      </div>
      <div class="zodiac-item">
        <span class="label">年属：</span>
        <span class="value">{{ yearZodiac || "——" }}年</span>
      </div>
      <div class="zodiac-item">
        <span class="label">月属：</span>
        <span class="value">{{ monthZodiac || "——" }}月</span>
      </div>
      <div class="zodiac-item">
        <span class="label">日属：</span>
        <span class="value">{{ dayZodiac || "——" }}日</span>
      </div>
    </div>
    <!-- 温馨提示 -->
      <div class="zodiac-item">
        <span class="label">这一天是</span>
        <span class="value">{{ yearZodiac || "——" }}年{{ monthZodiac || "——" }}月{{ dayZodiac || "——" }}日，哇！</span>
      </div>
  </div>
</template>

<script>
// 仅引入核心Solar类，避免多余依赖冲突
import { Solar } from 'lunar-javascript';

export default {
  name: 'ZodiacQuery',
  data() {
    return {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate(),
      yearZodiac: '',
      monthZodiac: '',
      dayZodiac: '',
      lunarShortText: '',
      showResult: false,
      lichunText: '', // 新增：存储立春日期文本
      lichunSolar: null // 新增：存储立春的公历日期对象
    };
  },
  computed: {
    yearRange() {
      const range = [];
      for (let y = 1900; y <= 2100; y++) range.push(y);
      return range;
    },
    getDayRange() {
      const lastDay = new Date(this.year, this.month, 0).getDate();
      const range = [];
      for (let d = 1; d <= lastDay; d++) range.push(d);
      return range;
    }
  },
  mounted() {
    this.getLichunDate(this.year); // 初始化获取立春
    this.calculateZodiac();
    this.showResult = true;
  },
  methods: {
    refreshCalendarAndCalculate() {
      this.day = 1;
      this.getLichunDate(this.year); // 切换年份时重新获取立春
      this.calculateZodiac();
      this.showResult = true;
    },
    handleDayClick(day) {
      this.day = day;
      this.calculateZodiac();
      this.showResult = true;
    },
    // 简化农历日提取
    getLunarDayText(solarYear, solarMonth, solarDay) {
      try {
        const solar = Solar.fromYmd(solarYear, solarMonth, solarDay);
        const lunar = solar.getLunar();
        return lunar.getDayInChinese() || "";
      } catch (e) {
        return "";
      }
    },
    // 修复节气提取
    getJieQiText(solarYear, solarMonth, solarDay) {
      try {
        const solar = Solar.fromYmd(solarYear, solarMonth, solarDay);
        const lunar = solar.getLunar();
        const jieQi = lunar.getJieQi() || solar.getJieQi();
        if (!jieQi || jieQi.trim() === "") {
          return "";
        }
        return jieQi.replace(/节气$/, "");
      } catch (e) {
        return "";
      }
    },
    // 新增：判断某一天是不是立春
    isLichunDay(solarYear, solarMonth, solarDay) {
      if (!this.lichunSolar) return false;
      return solarYear === this.lichunSolar.getFullYear() &&
             solarMonth === this.lichunSolar.getMonth() + 1 &&
             solarDay === this.lichunSolar.getDate();
    },
    // 工具方法：获取指定公历年的立春日期（修改后更精准）
    getLichunDate(solarYear) {
      try {
        this.lichunSolar = null;
        // 立春范围：1月20日-2月20日，缩小遍历范围
        for (let month = 1; month <= 2; month++) {
          const startDay = month === 1 ? 20 : 1;
          const endDay = month === 1 ? 31 : 20;
          for (let day = startDay; day <= endDay; day++) {
            const solar = Solar.fromYmd(solarYear, month, day);
            const lunar = solar.getLunar();
            const jieqi = lunar.getJieQi();
            if (jieqi && jieqi.includes("立春")) {
              this.lichunSolar = new Date(solarYear, month - 1, day);
              this.lichunText = `${month}月${day}日`;
              return;
            }
          }
        }
        // 兜底
        this.lichunSolar = new Date(solarYear, 1, 4);
        this.lichunText = `2月4日（默认）`;
      } catch (e) {
        this.lichunSolar = new Date(solarYear, 1, 4);
        this.lichunText = `2月4日（默认）`;
      }
    },
    // 核心修复：计算生肖（立春分界，正确切换年份）
    calculateZodiac() {
      try {
        const targetSolar = Solar.fromYmd(this.year, this.month, this.day);
        const targetLunar = targetSolar.getLunar();
        const selectedDate = new Date(this.year, this.month - 1, this.day);

        const zhiToZodiac = {
          '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔',
          '辰': '龙', '巳': '蛇', '午': '马', '未': '羊',
          '申': '猴', '酉': '鸡', '戌': '狗', '亥': '猪'
        };

        // ========== 核心修复：正确获取立春前后的农历年干支 ==========
        let zodiacZhi;
        if (selectedDate >= this.lichunSolar) {
          // 立春后：取【立春当天】的农历年干支（就是当年的干支）
          const lichunSolar = Solar.fromYmd(this.lichunSolar.getFullYear(), this.lichunSolar.getMonth() + 2, this.lichunSolar.getDate());
          zodiacZhi = lichunSolar.getLunar().getYearZhi();
        } else {
          // 立春前：取【立春前一天】的农历年干支（就是上一年的干支）
          const dayBeforeLichun = new Date(this.lichunSolar.getTime() - 24 * 60 * 60 * 1000);
          const solarBefore = Solar.fromYmd(dayBeforeLichun.getFullYear(), dayBeforeLichun.getMonth(), dayBeforeLichun.getDate());
          zodiacZhi = solarBefore.getLunar().getYearZhi();
        }

        // 映射生肖
        this.yearZodiac = zhiToZodiac[zodiacZhi] || "未知";

        // 月属、日属不变
        this.monthZodiac = zhiToZodiac[targetLunar.getMonthZhi()] || "未知";
        this.dayZodiac = zhiToZodiac[targetLunar.getDayZhi()] || "未知";

        // 农历文本优化
        let lunarMonth = targetLunar.getMonthInChinese() || "";
        if (lunarMonth && !lunarMonth.endsWith("月")) {
          lunarMonth = lunarMonth.startsWith("闰") ? `${lunarMonth}月` : `${lunarMonth}月`;
        }
        const lunarDay = targetLunar.getDayInChinese() || "";
        this.lunarShortText = lunarMonth && lunarDay ? `${lunarMonth}${lunarDay}` : "——";

      } catch (e) {
        this.yearZodiac = this.monthZodiac = this.dayZodiac = "——";
        this.lunarShortText = "——";
        console.log("查询异常：", e);
      }
    },
    // ========== 新增：年份切换方法（无核心逻辑改动） ==========
    switchYear(delta) {
      const newYear = this.year + delta;
      // 限制在yearRange的1900-2100范围内
      if (newYear >= 1900 && newYear <= 2100) {
        this.year = newYear;
        this.refreshCalendarAndCalculate();
      }
    },
    // ========== 新增：月份切换方法（无核心逻辑改动） ==========
    switchMonth(delta) {
      let newMonth = this.month + delta;
      let newYear = this.year;

      // 月份越界处理（1月往前跳→上一年12月，12月往后跳→下一年1月）
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      } else if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }

      // 年份仍限制在1900-2100范围内
      if (newYear >= 1900 && newYear <= 2100) {
        this.year = newYear;
        this.month = newMonth;
        this.refreshCalendarAndCalculate();
      }
    }
  }
};
</script>

<style scoped>
.zodiac-query {
  max-width: 600px;
  margin: 50px auto;
  padding: 30px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  text-align: center;
}

.query-title {
  font-size: 24px;
  font-weight: bold;
  color: #222;
  margin-bottom: 30px;
}

.date-selector {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
}

/* ========== 新增：日期切换组样式 ========== */
.date-switch-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ========== 新增：箭头按钮样式（蓝色三角形，移除hover变化） ========== */
.arrow-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.triangle {
  width: 0;
  height: 0;
  border-style: solid;
  /* 移除transition，避免任何颜色变化动画 */
}

.triangle.left {
  /* 左箭头：蓝色 */
  border-width: 8px 12px 8px 0;
  border-color: transparent #2196F3 transparent transparent;
}

.triangle.right {
  /* 右箭头：蓝色 */
  border-width: 8px 0 8px 12px;
  border-color: transparent transparent transparent #2196F3;
}

.date-selector select {
  padding: 10px 18px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: #fff url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23222' d='M8 11L3 6h10z'/%3E%3C/svg%3E") no-repeat right 10px center;
  background-size: 12px;
  color: #222;
  font-size: 16px;
  outline: none;
  cursor: pointer;
  appearance: none;
  padding-right: 35px;
}

.date-selector select:hover {
  border-color: #BC2F3F;
}

/* 新增：立春提示样式 */
.lichun-tip {
  color: #BC2F3F;
  font-weight: 500;
  font-size: 15px;
  margin-bottom: 20px;
  padding: 5px;
  background: #FAF5F5;
  border-radius: 4px;
}

.calendar-grid {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #F5F5F5;
  border-radius: 8px;
}

.calendar-header {
  margin-bottom: 15px;
}

.calendar-title {
  font-size: 18px;
  color: #222;
  font-weight: 500;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.day-btn {
  padding: 8px 0;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  background: #fff;
  color: #222;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70px;
}

/* 新增：立春日期高亮 */
.day-btn.lichun {
  border-color: #4CAF50;
  background: #F1FFF1;
}
.day-btn.lichun .jieqi-tag {
  background: #4CAF50;
  color: #fff;
}

.day-btn:hover {
  border-color: #BC2F3F;
  color: #BC2F3F;
  background: #FAF5F5;
}

.day-btn.active {
  background: #BC2F3F;
  color: #fff;
  border-color: #BC2F3F;
}

.solar-day {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.lunar-day {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 2px;
}

.jieqi-tag {
  font-size: 10px;
  color: #E63946;
  font-weight: 500;
  background: #FFF5F5;
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.day-btn.active .lunar-day {
  color: #fff;
  opacity: 0.9;
}
.day-btn.active .jieqi-tag {
  color: #FFD6D9;
  background: #C1292E;
}

.zodiac-result {
  padding: 20px;
  border: 1px solid #F5F5F5;
  border-radius: 8px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.lunar-full-info {
  font-size: 19px;
  color: #222;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #F5F5F5;
}

.zodiac-item {
  font-size: 18px;
  margin: 15px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.zodiac-item .label {
  font-weight: bold;
  color: #BC2F3F;
  width: 80px;
  text-align: right;
}

.zodiac-item .value {
  color: #333;
  font-size: 20px;
  font-weight: 500;
}
</style>