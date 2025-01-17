import React, { useState, useEffect } from 'react'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import CloseButton from 'react-bootstrap/CloseButton';
import getTotalPowerDamage from '../utility/getTotalPowerDamage';
import { getCritStrikesPPM, isInCritStrikesWindow } from '../utility/critStrikes';

const getProcDamage = (power) => {
  let damage = 0;
  if(!power.isAoE) {
    const standardChance = Math.min(0.90, ((power.rechargeTime / (1 + power.rechargeEnhancement) + power.castTime) * 3.5 / 60));
    const purpleChance = Math.min(0.90, ((power.rechargeTime / (1 + power.rechargeEnhancement) + power.castTime) * 4.5 / 60));
    damage += (((power.standardProcs * (71.75 * standardChance)) + (power.purpleProcs * (107.1 * purpleChance))));
  } else {
    const arc = power.arc;
    const radius = power.radius;
    const standardChance = Math.min(0.90, (((power.rechargeTime / (1 + power.rechargeEnhancement) + power.castTime) * 3.5 / (60 * (1 + (radius * (((11 * arc) + 540) / 40000)))))))
    const purpleChance = Math.min(0.90, (((power.rechargeTime / (1 + power.rechargeEnhancement) + power.castTime) * 4.5 / (60 * (1 + (radius * (((11 * arc) + 540) / 40000)))))))
    damage += (((power.standardProcs * (71.75 * standardChance)) + (power.purpleProcs * (107.1 * purpleChance))));
  };
  return damage;
}

export const PowerRow = (props) => {
  const [displayScrapperCriticalDamage, setDisplayScrapperCriticalDamage] = useState(true);
  const [displayScrappersStrikeATO, setDisplayScrappersStrikeATO] = useState(false);
  const [displayStealthCrit, setDisplayStealthCrit] = useState(false);
  const [targetsHit, setTargetsHit] = useState(1);
  const [standardProcs, setStandardProcs] = useState(0);
  const [purpleProcs, setPurpleProcs] = useState(0);
  const [damageEnhancement, setDamageEnhancement] = useState(0);
  const [rechargeEnhancement, setRechargeEnhancement] = useState(0);
  const [powerIsInCritStrikesWindow, setPowerIsInCritStrikesWindow] = useState(false);
  const [comboLevel, setComboLevel] = useState(0);
  const [currentPowerName, setCurrentPowerName] = useState(props.chainPowers[props.row].name);
  const [numberOfTeammates, setNumberOfTeammtes] = useState(0);
  const [assassinsFocusStacks, setAssassinsFocusStacks] = useState(0);
 
  useEffect(() => {
    let newChainPowers = [...props.chainPowers];
    let powerDamage = 0;
    let powerInfo;

    for(var i = 0; i < newChainPowers.length; i++) {
      if(newChainPowers[i].category === "primary") {
        powerInfo = props.primaryPowersetData.find(power => power.name === newChainPowers[i].name);
      } else if (newChainPowers[i].category === "secondary") {
        powerInfo = props.secondaryPowersetData.find(power => power.name === newChainPowers[i].name);
      } else if (newChainPowers[i].category === "epic") {
        powerInfo = props.epicPowersetData.find(power => power.name === newChainPowers[i].name);
      }

      powerDamage = getTotalPowerDamage({
        power: powerInfo, 
        archetype: props.archetype,
        displayScrapperCriticalDamage: newChainPowers[i].displayScrapperCriticalDamage,
        displayScrappersStrikeATO: newChainPowers[i].displayScrappersStrikeATO,
        powerIsInCritStrikesWindow: isInCritStrikesWindow(props.chainPowers, i),
        critStrikesChance: getCritStrikesPPM(newChainPowers, i),
        comboLevel: newChainPowers[i].comboLevel,
        targetsHit: newChainPowers[i].targetsHit,
        displayStealthCrit: newChainPowers[i].displayStealthCrit,
        numberOfTeammates: numberOfTeammates,
        assassinsFocusStacks: assassinsFocusStacks,
        isAoE: newChainPowers[i].isAoE
      });

      /* get base damage */
      powerDamage += newChainPowers[i].damageEnhancement > 0 ? powerDamage * newChainPowers[i].damageEnhancement : 0;
      /* get proc damage */
      powerDamage += getProcDamage(newChainPowers[i]);
      /* update chain power damage */
      newChainPowers[i].damage = powerDamage;
    }
    
    props.setChainPowers([...newChainPowers])
  }, [
    targetsHit,
    displayScrapperCriticalDamage,
    displayScrappersStrikeATO,
    displayStealthCrit,
    standardProcs,
    purpleProcs,
    damageEnhancement,
    rechargeEnhancement,
    powerIsInCritStrikesWindow,
    comboLevel,
    currentPowerName,
    numberOfTeammates,
    assassinsFocusStacks
  ]);

  const handlePowerChange = (e) => {

    const selectedPower = JSON.parse(e.target.value);
    let currentChainPowers = [...props.chainPowers];

    let castTimeBeforeEffect = 0;
    if(selectedPower.custom_fx.length === 0) {
      castTimeBeforeEffect = selectedPower.fx.frames_before_hit / 30;
    } else {
      castTimeBeforeEffect = selectedPower.custom_fx[0].fx.frames_before_hit / 30
    }
    
    const newChainPower = {
      name: selectedPower.name,
      displayName: selectedPower.display_name,
      category: currentChainPowers[props.row].category,
      damageEnhancement: 0,
      rechargeEnhancement: 0,
      standardProcs: 0,
      purpleProcs: 0,
      damage: 0,
      castTime: selectedPower.activation_time,
      castTimeBeforeEffect: castTimeBeforeEffect,
      enduranceCost: selectedPower.endurance_cost,
      rechargeTime: selectedPower.recharge_time,
      powerIsRecharged: false,
      isCritStrikes: currentChainPowers[props.row].isCritStrikes,
      displayScrapperCriticalDamage: currentChainPowers[props.row].displayScrapperCriticalDamage,
      displayScrappersStrikeATO: currentChainPowers[props.row].displayScrappersStrikeATO,
      displayStealthCrit: currentChainPowers[props.row].displayStealthCrit,
      powerIsInCritStrikesWindow: isInCritStrikesWindow(props.chainPowers, props.row),
      comboLevel: 0,
      isAoE: selectedPower.attack_types.includes('Area') || selectedPower.arc > 0,
      arc: selectedPower.arc * (180 / Math.PI),
      radius: selectedPower.radius,
      maxTargetsHit: selectedPower.max_targets_hit,
      targetsHit: selectedPower.attack_types.includes('Area') || selectedPower.arc > 0 ? currentChainPowers[props.row].targetsHit : 1,
      assassinsFocusStacks: 0,
    }

    currentChainPowers[props.row] = newChainPower;
    props.setChainPowers([...currentChainPowers]);
    setCurrentPowerName(newChainPower.name);
    setPowerIsInCritStrikesWindow(newChainPower.powerIsInCritStrikesWindow);
  }

  const handleDamageEnhancementChange = (e) => {
    const newPowers = [...props.chainPowers];
    newPowers[props.row].damageEnhancement = Number(e.target.value) / 100;
    props.setChainPowers([...newPowers]);
    setDamageEnhancement(Number(e.target.value) / 100);
  }

  const handleRechargeEnhancementChange = (e) => {
    const newPowers = [...props.chainPowers];
    newPowers[props.row].rechargeEnhancement = Number(e.target.value) / 100;
    props.setChainPowers([...newPowers]);
    setRechargeEnhancement(Number(e.target.value) / 100)
  }

  const handleStandardProcsChange = (e) => {
    const newPowers = [...props.chainPowers];
    newPowers[props.row].standardProcs = Number(e.target.value);
    props.setChainPowers([...newPowers]);
    setStandardProcs(e.target.value);
  }

  const handlePurpleProcsChange = (e) => {
    const newPowers = [...props.chainPowers];
    newPowers[props.row].purpleProcs = Number(e.target.value);
    props.setChainPowers([...newPowers]);
    setPurpleProcs(e.target.value);
  }

  const handleComboLevelChange = (e) => {
    const newPowers = [...props.chainPowers];
    newPowers[props.row].comboLevel = e.target.value;
    props.setChainPowers([...newPowers]);
    setComboLevel(e.target.value);
  }

  const handleDisplayScrapperCriticalDamageChange = (e) => {
    const newPowers = [...props.chainPowers];
    newPowers[props.row].displayScrapperCriticalDamage = e.target.checked;
    props.setChainPowers([...newPowers]);
    setDisplayScrapperCriticalDamage(e.target.checked);
  }

  const handleDisplayScrappersStrikeATOChange = (e) => {
    const newPowers = [...props.chainPowers];
    newPowers[props.row].displayScrappersStrikeATO = e.target.checked;
    props.setChainPowers([...newPowers]);
    setDisplayScrappersStrikeATO(e.target.checked);
  }

  const handleTargetsHitChange = (e) => {
    const newPowers = [...props.chainPowers];
    newPowers[props.row].targetsHit = Number(e.target.value);
    props.setChainPowers([...newPowers]);
    setTargetsHit(e.target.value);
  }

  const handleDisplayStealthCrit = (e) => {
    const newPowers = [...props.chainPowers];
    newPowers[props.row].displayStealthCrit = e.target.checked;
    props.setChainPowers([...newPowers]);
    setDisplayStealthCrit(e.target.checked);
  }

  const handleNumberOfTeammtesChange = (e) => {
    const newPowers = [...props.chainPowers];
    newPowers[props.row].numberOfTeammates = e.target.value;
    props.setChainPowers([...newPowers]);
    setNumberOfTeammtes(e.target.value);
  }

  const handleAssassinsFocusStacksChange = (e) => {
    const newPowers = [...props.chainPowers];
    newPowers[props.row].assassinsFocusStacks = e.target.value;
    props.setChainPowers([...newPowers]);
    setAssassinsFocusStacks(e.target.value);
  }

  const handleRemovePower = (e) => {
    let currentChainPowers = [...props.chainPowers];
    currentChainPowers.splice(e.target.value, 1);
    props.setChainPowers([...currentChainPowers])
  }

  return (
    <div 
      className={isInCritStrikesWindow(props.chainPowers, props.row) ? "isInCritStrikesWindow list-group-item" : 'list-group-item'}
      style={props.isCritStrikes ? {borderBottom: "#7f060a 3px solid", alignItems: "center"} : {alignItems: "center"}}
    >
      <Row>
        <Col>
          <Form.Group className="py-3">
            <Form.Label>Power</Form.Label>
            <Form.Select
              onChange={(e) => handlePowerChange(e)}
              value={JSON.stringify(props[`${props.chainPowers[props.row].category}PowersetData`].find((power) => power.name === props.chainPowers[props.row].name))}
            >
              {
                props.category === "primary" && props.primaryPowersetData.map((power) => {
                  return (
                    <option
                      key={power.full_name}
                      value={JSON.stringify(power)}
                    >
                      {power.display_name}
                    </option>
                  )
                })
              }
              {
                props.category === "secondary" && props.secondaryPowersetData.map((power) => {
                  return (
                    <option
                      key={power.full_name}
                      value={JSON.stringify(power)}
                    >
                      {power.full_name.split('.')[2].replace(/_/g," ")}
                    </option>
                  )
                })
              }
              {
                props.category === "epic" && props.epicPowersetData.map((power) => {
                  return (
                    <option
                      key={power.full_name}
                      value={JSON.stringify(power)}
                    >
                      {power.full_name.split('.')[2].replace(/_/g," ")}
                    </option>
                  )
                })
              }
            </Form.Select>
          </Form.Group>
        </Col>
        {
          (currentPowerName === "Sweeping_Cross" || currentPowerName === "Spinning_Strike" || currentPowerName === "Crushing_Uppercut") && (
            <Col>
              <Form.Group className="py-3">
              <Form.Label>Combo Level</Form.Label>
                <Form.Select
                  onChange={(e) => handleComboLevelChange(e)}
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </Form.Select>
              </Form.Group>
            </Col>
          )
        }
        {
          props.archetype === "Stalker" && (
            <Col>
              <Form.Group className="py-3">
              <Form.Label>Teammates</Form.Label>
                <Form.Select
                  onChange={(e) => handleNumberOfTeammtesChange(e)}
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                  <option value={6}>6</option>
                  <option value={7}>7</option>
                </Form.Select>
              </Form.Group>
            </Col>
          )
        }
        {
          (currentPowerName.includes("Assassins") && currentPowerName.includes("Quick")) && (
            <Col>
              <Form.Group className="py-3">
              <Form.Label>Assassin's Focus Stacks</Form.Label>
                <Form.Select
                  onChange={e => handleAssassinsFocusStacksChange(e)}
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </Form.Select>
              </Form.Group>
            </Col>
          )
        }
        <Col>
          <Form.Group className="py-3">
            <Form.Label>Damage Bonus</Form.Label>
            <Form.Control
              onChange={(e) => handleDamageEnhancementChange(e)}
              type="number" 
              placeholder="0"
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="py-3">
          <Form.Label>Recharge Bonus</Form.Label>
            <Form.Control
              onChange={(e) => handleRechargeEnhancementChange(e)}
              type="number" 
              placeholder="0"
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="py-3">
            <Form.Label>Standard Procs</Form.Label>
            <Form.Select
                onChange={(e) => handleStandardProcsChange(e)}
            >
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="py-3">
            <Form.Label>Purple Procs</Form.Label>            
            <Form.Select
                onChange={(e) => handlePurpleProcsChange(e)}
            >
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <CloseButton
          value={props.row}
          onClick={(e) => handleRemovePower(e)}
        />
      </Row>
      {
        props.archetype === "Scrapper" && (
          <Row>
            <Col>
              <Form.Group className="mb-2">
                <Form.Check
                  type="checkbox"
                  defaultChecked={true}
                  value={displayScrapperCriticalDamage}
                  label="Show Average Critical Damage"
                  onChange={e => handleDisplayScrapperCriticalDamageChange(e)}
                />
                <Form.Check
                  type="checkbox"
                  disabled={displayScrapperCriticalDamage === false}
                  defaultChecked={false}
                  value={displayScrappersStrikeATO}
                  label="Superior Scrapper's Strike ATO (+6% Crit Bonus)"
                  onChange={e => handleDisplayScrappersStrikeATOChange(e)}
                />
              </Form.Group>
            </Col>
          </Row>
        )
      }
      {
        (props.archetype === "Stalker" && (props.category === "primary" || props.category === "epic")) && (
          <Row>
            <Col>
              <Form.Group className="mb-2">
                <Form.Check
                  type="checkbox"
                  defaultChecked={false}
                  value={displayStealthCrit}
                  label="Show Damage from Hide (Stealth Crit)"
                  onChange={e => handleDisplayStealthCrit(e)}
                />
                {
                  props.primaryPowersetData[0].full_name.split('.')[1] === "Martial_Arts" && (
                    <Form.Check
                      type="checkbox"
                      defaultChecked={true}
                      value={displayScrapperCriticalDamage}
                      label="Show Eagle's Claw Crit Bonus"
                      onChange={e => handleDisplayScrapperCriticalDamageChange(e)}
                    />
                  )
                }
              </Form.Group>
            </Col>
          </Row>
        )
      }
      {
        props.chainPowers[props.row].isAoE && (
          <Row>
            <Form.Label>Targets Hit: {props.chainPowers[props.row].targetsHit}</Form.Label>
            <Form.Range 
              value={props.chainPowers[props.row].targetsHit}
              onChange={e => handleTargetsHitChange(e)}
              min={1}
              max={props.chainPowers[props.row].maxTargetsHit}
            />
          </Row>
        )
      }
      <Col className="fw-bold">
        <span>Damage: {props.chainPowers[props.row].damage.toFixed(2)}</span>
      </Col>
    </div>
  );
}
