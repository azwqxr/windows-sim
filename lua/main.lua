















-- TABS
local js = require("js")
local document = js.global.document

local function isNullish(v)
  return v == nil or v == js.null
end

local function tabHandler(e, tabButtons)
  e:preventDefault()
  local target = e.target
  local tabContainer = target.parentElement.parentElement
  local targetId = target:getAttribute("aria-controls")

  tabButtons:forEach(function(_self, tabButton)
    tabButton:setAttribute("aria-selected", false)
  end)
  target:setAttribute("aria-selected", true)
  target:focus()

  tabContainer:querySelectorAll("[role=tabpanel]"):forEach(function(_self, tabPanel)
    tabPanel:setAttribute("hidden", true)
  end)

  local panel = tabContainer:querySelector("[role=tabpanel]#" .. targetId)
  panel:removeAttribute("hidden")
end

document:addEventListener("mousedown", function(_self, e)
  local tab = e.target:closest("[role=tab]")
  if isNullish(tab) then return end
  local tabList = tab:closest("[role=tablist]")
  local tabButtons = tabList:querySelectorAll("[role=tab]")
  tabHandler(e, tabButtons)
end)

document:addEventListener("focus", function(_self, e)
  if isNullish(e.target.closest) then return end
  local tab = e.target:closest("[role=tab]")
  if isNullish(tab) then return end
  local tabList = tab:closest("[role=tablist]")
  local tabButtons = tabList:querySelectorAll("[role=tab]")
  tabHandler(e, tabButtons)
end, true)

-- Tabs > Sample Tabs
local tabList = document:querySelector("[aria-label='Sample Tabs']")
local tabButtons = tabList:querySelectorAll("[role=tab]")
tabButtons:forEach(function(_self, tabButton)
  tabButton:addEventListener("mousedown", function(_self2, evt)
    tabHandler(evt, tabButtons)
  end)
end)
tabButtons:forEach(function(_self, tabButton)
  tabButton:addEventListener("focus", function(_self2, evt)
    tabHandler(evt, tabButtons)
  end)
end)

-- Tabs > Tabs Template
local templateTabList = document:querySelector("[aria-label='Tabs Template']")
local templateTabButtons = templateTabList:querySelectorAll("[role=tab]")

-- Window Body > Window with Tabs
local windowTabList = document:querySelector("[aria-label='Window with Tabs']")
local windowTabButtons = windowTabList:querySelectorAll("[role=tab]")
windowTabButtons:forEach(function(_self, tabButton)
  tabButton:addEventListener("mousedown", function(_self2, evt)
    tabHandler(evt, windowTabButtons)
  end)
end)
windowTabButtons:forEach(function(_self, tabButton)
  tabButton:addEventListener("focus", function(_self2, evt)
    tabHandler(evt, windowTabButtons)
  end)
end)